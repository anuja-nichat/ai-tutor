import "./Loader.css";

export default function Loader({ children }) {
    return (
        <div className="loader-container">
            {/* Nucleus */}
            <div className="nucleus"></div>

            {/* Orbits with electrons */}
            <div className="orbit orbit1">
                <div className="electron"></div>
            </div>
            <div className="orbit orbit2">
                <div className="electron"></div>
            </div>
            <div className="orbit orbit3">
                <div className="electron"></div>
            </div>
            <div className="orbit orbit4">
                <div className="electron"></div>
            </div>
            <div className="orbit orbit5">
                <div className="electron"></div>
            </div>
            <div className="orbit orbit6"> {/* NEW ORBIT 6 */}
                <div className="electron"></div>
            </div>

            <p className="loading-text">Loading...</p>
        </div>
    );
}