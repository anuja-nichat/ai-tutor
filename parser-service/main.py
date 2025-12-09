from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import spacy
import re
from sentence_transformers import SentenceTransformer
import os
import tempfile
import json
from transformers import pipeline
from openai import OpenAI  # Move this to top

app = Flask(__name__)
nlp = spacy.load("en_core_web_sm")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Load Hugging Face model (small & CPU-friendly)
generator = pipeline("text2text-generation", model="google/flan-t5-base")

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# ---------------- PDF Parsing ----------------

def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()
    return text

def detect_subject(text):
    """Improved subject detection using weighted keyword scoring"""
    subject_keywords = {
        'Physics': [
            'mechanics', 'optics', 'thermodynamics', 'kinematics',
            'dynamics', 'relativity', 'electromagnetic', 'oscillations',
            'waves', 'motion', 'energy', 'power', 'force'
        ],
        'Chemistry': [
            'chemistry', 'mole concept', 'periodic table', 'chemical bonding',
            'thermochemistry', 'equilibrium', 'redox', 'hydrocarbons',
            'organic', 'inorganic', 'structure of atom'
        ],
        'Mathematics': [
            'algebra', 'calculus', 'trigonometry', 'geometry', 'statistics',
            'probability', 'matrices', 'determinants', 'vectors'
        ],
        'Biology': [
            'cell biology', 'genetics', 'ecology', 'physiology',
            'biochemistry', 'taxonomy', 'photosynthesis', 'respiration'
        ],
        'Psychology': [
            'psychology', 'cognition', 'behavior', 'counseling',
            'personality', 'mental health', 'therapy'
        ]
    }

    text_lower = text.lower()
    scores = {subject: 0 for subject in subject_keywords}

    for subject, keywords in subject_keywords.items():
        for kw in keywords:
            scores[subject] += text_lower.count(kw)

    best_subject = max(scores, key=scores.get)
    if scores[best_subject] > 2:
        return best_subject
    return "General"

def detect_class_level(text):
    """Detect class/grade level from text"""
    patterns = [
        (r'class\s+xi\b', '11'),
        (r'class\s+11\b', '11'),
        (r'class\s+xii\b', '12'),
        (r'class\s+12\b', '12'),
        (r'grade\s+xi\b', '11'),
        (r'grade\s+11\b', '11'),
        (r'grade\s+xii\b', '12'),
        (r'grade\s+12\b', '12'),
        (r'std\.?\s+xi\b', '11'),
        (r'std\.?\s+11\b', '11'),
        (r'std\.?\s+xii\b', '12'),
        (r'std\.?\s+12\b', '12'),
    ]

    for pattern, class_level in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return class_level
    return "Unknown"

def parse_topics_universal(text):
    """Extract topics (Units, Chapters, Subtopics) from syllabus PDFs"""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    topics = []

    unit_pattern = re.compile(r'Unit[\s–-]*([IVXLC\d]+)\s*[:\-]?\s*(.+)', re.IGNORECASE)
    chapter_pattern = re.compile(r'Chapter[\s–-]*(\d+)\s*[:\-]?\s*(.+)', re.IGNORECASE)

    subtopic_patterns = [
        re.compile(r'^\d+\.\s+(.+)'),
        re.compile(r'^[•\-*]\s+(.+)'),
        re.compile(r'^[a-z]\)\s+(.+)'),
        re.compile(r'^[IVX]+\.\s+(.+)'),
    ]

    for line in lines:
        if any(term in line.lower() for term in
               ['page', 'period', 'mark', 'hours', 'reference',
                'book', 'textbook', 'examination', 'evaluation', 'scheme']):
            continue

        unit_match = unit_pattern.match(line)
        if unit_match:
            topics.append(f"Unit {unit_match.group(1)}: {unit_match.group(2).strip()}")
            continue

        chapter_match = chapter_pattern.match(line)
        if chapter_match:
            topics.append(f"Chapter {chapter_match.group(1)}: {chapter_match.group(2).strip()}")
            continue

        for pattern in subtopic_patterns:
            sub_match = pattern.match(line)
            if sub_match:
                topic = re.sub(r'\s+', ' ', sub_match.group(1)).strip()
                if 3 <= len(topic) <= 150:
                    topics.append(topic)
                break

    seen = set()
    final_topics = []
    for t in topics:
        if t not in seen:
            final_topics.append(t)
            seen.add(t)

    return final_topics

def detect_multiple_subjects(text):
    """Detect all subjects present in the document"""
    subject_keywords = {
        'Physics': ['mechanics', 'optics', 'thermodynamics', 'kinematics', 'dynamics', 
                   'electromagnetic', 'oscillations', 'waves', 'motion', 'force', 'physics'],
        'Chemistry': ['chemistry', 'mole concept', 'periodic table', 'chemical bonding',
                     'thermochemistry', 'equilibrium', 'redox', 'hydrocarbons', 'organic', 
                     'inorganic', 'atom', 'molecule', 'reaction'],
        'Mathematics': ['algebra', 'calculus', 'trigonometry', 'geometry', 'statistics',
                       'probability', 'matrices', 'determinants', 'vectors', 'mathematics',
                       'quadratic', 'binomial', 'permutation', 'combination']
    }
    
    text_lower = text.lower()
    detected_subjects = []
    
    for subject, keywords in subject_keywords.items():
        score = sum(text_lower.count(kw) for kw in keywords)
        if score > 3:  # Threshold for detecting a subject
            detected_subjects.append(subject)
    
    return detected_subjects if detected_subjects else ['General']

def parse_topics_by_subject(text):
    """Parse topics and assign them to detected subjects based on context"""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Enhanced subject markers with more variations
    subject_markers = {
        'Physics': ['physics', 'physical world', 'motion', 'mechanics', 'thermodynamics', 'kinematics', 'optics'],
        'Chemistry': ['chemistry', 'chemical', 'matter', 'periodic table', 'organic', 'inorganic', 'atomic structure', 'mole concept'],
        'Mathematics': ['mathematics', 'maths', 'algebra', 'calculus', 'trigonometry', 'geometry', 
                       'complex number', 'mathematical', 'sets', 'relations', 'functions', 
                       'matrices', 'determinants', 'probability', 'statistics', 'binomial', 'permutation']
    }
    
    subjects_topics = {}
    current_subject = None
    last_detected_subject = None
    
    unit_pattern = re.compile(r'Unit[\s–-]*([IVXLC\d]+)\s*[:\-]?\s*(.+)', re.IGNORECASE)
    chapter_pattern = re.compile(r'Chapter[\s–-]*(\d+)\s*[:\-]?\s*(.+)', re.IGNORECASE)
    
    # First pass: detect subject section headers (like "SECTION A: MATHEMATICS")
    section_pattern = re.compile(r'(?:SECTION|PART|PAPER)\s*[A-Z]?\s*[:\-]?\s*(PHYSICS|CHEMISTRY|MATHEMATICS|MATHS)', re.IGNORECASE)
    
    for i, line in enumerate(lines):
        line_lower = line.lower()
        
        # Check for explicit section headers
        section_match = section_pattern.search(line)
        if section_match:
            subject_name = section_match.group(1).strip()
            if subject_name.lower() in ['mathematics', 'maths']:
                current_subject = 'Mathematics'
            elif subject_name.lower() == 'physics':
                current_subject = 'Physics'
            elif subject_name.lower() == 'chemistry':
                current_subject = 'Chemistry'
            
            if current_subject and current_subject not in subjects_topics:
                subjects_topics[current_subject] = []
            last_detected_subject = current_subject
            continue
        
        # Check if line is a subject header (short line with subject name)
        if len(line.split()) <= 5:
            for subject, markers in subject_markers.items():
                if any(marker in line_lower for marker in markers):
                    if subject not in subjects_topics:
                        subjects_topics[subject] = []
                    current_subject = subject
                    last_detected_subject = subject
                    break
        
        # Skip noise lines
        if any(term in line_lower for term in ['page', 'period', 'mark', 'hours', 'reference', 
                                                'book', 'textbook', 'examination', 'evaluation', 
                                                'contents', 'total', 'weightage']):
            continue
        
        # Parse units and chapters
        unit_match = unit_pattern.match(line)
        if unit_match:
            topic = f"Unit {unit_match.group(1)}: {unit_match.group(2).strip()}"
            
            # Try to determine subject from topic content if no current subject
            if not current_subject and last_detected_subject:
                current_subject = last_detected_subject
            
            if not current_subject:
                # Guess subject from topic keywords
                topic_lower = topic.lower()
                for subject, markers in subject_markers.items():
                    if any(marker in topic_lower for marker in markers):
                        current_subject = subject
                        if subject not in subjects_topics:
                            subjects_topics[subject] = []
                        break
            
            if current_subject:
                subjects_topics[current_subject].append(topic)
            continue
        
        chapter_match = chapter_pattern.match(line)
        if chapter_match:
            topic = f"Chapter {chapter_match.group(1)}: {chapter_match.group(2).strip()}"
            
            # Try to determine subject from topic content
            if not current_subject and last_detected_subject:
                current_subject = last_detected_subject
            
            if not current_subject:
                topic_lower = topic.lower()
                for subject, markers in subject_markers.items():
                    if any(marker in topic_lower for marker in markers):
                        current_subject = subject
                        if subject not in subjects_topics:
                            subjects_topics[subject] = []
                        break
            
            if current_subject:
                subjects_topics[current_subject].append(topic)
            continue
    
    return subjects_topics

@app.route("/parse", methods=["POST"])
def parse_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
        filepath = tmp_file.name
        file.save(filepath)

    try:
        text = extract_text_from_pdf(filepath)
        class_level = detect_class_level(text)
        
        if class_level == "Unknown":
            class_level = "11"
        
        # Detect multiple subjects
        detected_subjects = detect_multiple_subjects(text)
        subjects_topics = parse_topics_by_subject(text)
        
        # If no topics parsed by subject, use universal parser with intelligent subject assignment
        if not subjects_topics or sum(len(topics) for topics in subjects_topics.values()) == 0:
            topics = parse_topics_universal(text)
            
            # Try to assign topics to subjects based on content
            temp_subjects_topics = {}
            for topic in topics:
                topic_lower = topic.lower()
                assigned = False
                
                # Check for math keywords
                math_keywords = ['complex', 'quadratic', 'matrices', 'determinant', 'binomial', 
                               'permutation', 'combination', 'trigonometry', 'calculus', 'algebra',
                               'sets', 'relations', 'functions', 'probability', 'statistics']
                if any(kw in topic_lower for kw in math_keywords):
                    if 'Mathematics' not in temp_subjects_topics:
                        temp_subjects_topics['Mathematics'] = []
                    temp_subjects_topics['Mathematics'].append(topic)
                    assigned = True
                
                # Check for physics keywords
                if not assigned:
                    physics_keywords = ['motion', 'force', 'energy', 'power', 'work', 'thermodynamics',
                                      'kinematics', 'mechanics', 'optics', 'wave', 'oscillation']
                    if any(kw in topic_lower for kw in physics_keywords):
                        if 'Physics' not in temp_subjects_topics:
                            temp_subjects_topics['Physics'] = []
                        temp_subjects_topics['Physics'].append(topic)
                        assigned = True
                
                # Check for chemistry keywords
                if not assigned:
                    chemistry_keywords = ['atom', 'molecule', 'chemical', 'matter', 'periodic', 
                                        'organic', 'inorganic', 'redox', 'equilibrium', 'mole']
                    if any(kw in topic_lower for kw in chemistry_keywords):
                        if 'Chemistry' not in temp_subjects_topics:
                            temp_subjects_topics['Chemistry'] = []
                        temp_subjects_topics['Chemistry'].append(topic)
                        assigned = True
                
                # If still not assigned, use fallback
                if not assigned:
                    subject = detect_subject(text)
                    if subject == "Unknown":
                        subject = "General"
                    if subject not in temp_subjects_topics:
                        temp_subjects_topics[subject] = []
                    temp_subjects_topics[subject].append(topic)
            
            subjects_topics = temp_subjects_topics if temp_subjects_topics else {detect_subject(text): topics}
        
        # Build items and subjects dictionary
        items = []
        subjects_dict = {}
        
        for subject, topics in subjects_topics.items():
            if not topics:
                continue
                
            subjects_dict[subject] = topics
            
            # Create embeddings
            texts = [f'{class_level} | {subject} | {topic}' for topic in topics]
            vectors = embedder.encode(texts, convert_to_numpy=True).tolist()
            
            for topic, vec in zip(topics, vectors):
                items.append({
                    "class": class_level,
                    "subject": subject,
                    "topic": topic,
                    "embedding": vec
                })
        
        # If no subjects parsed, return error
        if not subjects_dict:
            return jsonify({"error": "No topics found in document"}), 400
        
        # Determine response format
        if len(subjects_dict) == 1:
            # Single subject format (backward compatible)
            subject = list(subjects_dict.keys())[0]
            return jsonify({
                "class": class_level,
                "subject": subject,
                "topics": subjects_dict[subject],
                "items": items,
                "message": f"Parsed {len(items)} topics for {subject} Class {class_level}"
            })
        else:
            # Multiple subjects format
            return jsonify({
                "class": class_level,
                "subjects": subjects_dict,
                "items": items,
                "message": f"Parsed {len(items)} topics across {len(subjects_dict)} subjects for Class {class_level}"
            })

    except Exception as e:
        print(f"Error processing file: {e}")
        return jsonify({"error": f"Failed to process file: {str(e)}"}), 500
    finally:
        if os.path.exists(filepath):
            os.unlink(filepath)

# ---------------- Quiz Generation ----------------

@app.route("/generate_quiz", methods=["POST"])
def generate_quiz():
    try:
        data = request.get_json()
        topic = data.get("topic", "").strip()
        subject = data.get("subject", "General").strip()

        print("Subject:", subject)
        print("Topic before cleanup:", topic)

        # ✅ Clean topic string (remove "Chapter N:" prefix if exists)
        if ":" in topic:
            topic = topic.split(":", 1)[1].strip()

        print("Topic after cleanup:", topic)

        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        prompt = f"""
        You are a quiz generator.
        Task: Generate exactly 15 multiple-choice questions (MCQs) for Class 11 {subject}, topic "{topic}".

        Each question must be in valid JSON format:
        {{
          "question": "string",
          "options": ["opt1", "opt2", "opt3", "opt4"],
          "answer": "one of the options"
        }}

        Return ONLY a JSON list of 15 questions, no explanations.
        """

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )

        raw_text = response.choices[0].message.content.strip()

        quiz_questions = []
        try:
            quiz_questions = json.loads(raw_text)
        except json.JSONDecodeError:
            import re
            match = re.search(r"\[.*\]", raw_text, re.S)
            if match:
                quiz_questions = json.loads(match.group())

        # Assign IDs
        for i, q in enumerate(quiz_questions, start=1):
            q["questionId"] = f"q{i}"

        return jsonify({
            "status": "success",
            "subject": subject,
            "topic": topic,
            "quiz": quiz_questions
        })

    except Exception as e:
        print("Error generating quiz:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)