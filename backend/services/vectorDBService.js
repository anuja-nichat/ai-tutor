const index = require("../utils/pinecone");
const Topic = require("../models/Topic");

async function upsertSyllabusItems(filename, className, syllabusId, items) {
  console.log('📦 Starting upsertSyllabusItems with:', {
    filename,
    className,
    syllabusId,
    itemCount: items.length
  });

  if (!Array.isArray(items)) {
    console.error('❌ Items is not an array');
    return [];
  }

  const vectorIds = [];

  for (let i = 0; i < items.length; i++) {
    console.log(`🔄 Processing item ${i + 1}/${items.length}`);
    const { subject, topic, embedding } = items[i];

    if (!embedding || !Array.isArray(embedding)) {
      console.warn(`⚠️ Skipping topic "${topic}" — no embedding found`);
      continue;
    }

    console.log(`📊 Embedding length: ${embedding.length}`);
    
    const vectorId = `${filename}-${i}`;
    vectorIds.push(vectorId);

    try {
      console.log(`🚀 Attempting Pinecone upsert for: ${vectorId}`);
      
      // upsert into Pinecone
      const upsertResult = await index.upsert([
        {
          id: vectorId,
          values: embedding,
          metadata: {
            class: className,
            subject,
            topic,
            filename,
          },
        },
      ]);
      console.log('✅ Pinecone upsert result:', upsertResult);
      console.log(`✅ Successfully upserted vector: ${vectorId}`);

    } catch (pineconeError) {
      console.error(`❌ Pinecone upsert failed for ${vectorId}:`, pineconeError.message);
      console.error('Full error:', pineconeError);
      continue;
    }

    try {
      // save into MongoDB Topic schema
      const newTopic = new Topic({
        syllabusId,
        subject,
        topic,
        vectorId,
      });
      await newTopic.save();
      console.log(`✅ Successfully saved to MongoDB: ${topic}`);

    } catch (mongoError) {
      console.error(`❌ MongoDB save failed for ${topic}:`, mongoError);
    }
  }

  console.log('🎉 Finished upsertSyllabusItems');
  return vectorIds;
}

module.exports = {
  upsertSyllabusItems,
};