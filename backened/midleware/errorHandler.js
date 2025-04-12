// Centralized error-handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(err.status || 500).json({ error: err.message || "Server Error" }); // Send error response
};
