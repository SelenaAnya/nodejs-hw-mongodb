export const errorHandler = (error, req, res, next) => {
  const { status = 500, message = 'Something went wrong' } = error;

  // Логування помилки
  console.error('Error occurred:', {
    status,
    message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  res.status(status).json({
    status,
    message,
    data: process.env.NODE_ENV === 'development' ? {
      stack: error.stack,
      details: error.details || null
    } : null
  });
};
