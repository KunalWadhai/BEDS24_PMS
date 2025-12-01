// src/middlewares/errorHandler.js
export function errorHandler(err, req, res, next) {
  try {
    // If called with no error object, create a default one
    if (!err) {
      err = new Error('Unknown server error');
      err.status = 500;
    }

    // Normalize basic fields
    const status = err?.status || 500;
    const message = err?.message || 'Internal server error';
    const details = err?.details;

    // Log a compact sanitized object for debugging
    console.error('[errorHandler]', {
      status,
      message,
      // small portion of stack for dev debugging
      stack: err?.stack ? String(err.stack).split('\n').slice(0, 6).join('\n') : undefined,
      details: details ?? undefined
    });

    // If res is not available or not a valid express response, just return (no crash)
    if (!res || typeof res.status !== 'function' || typeof res.json !== 'function') {
      // cannot send a HTTP response — make sure we don't throw and return gracefully
      // This usually happens if the handler was called outside of a request context
      return;
    }

    // Build response body
    const body = { success: false, error: message };
    if (details) body.details = details;

    // Send HTTP response
    res.status(status).json(body);
  } catch (handlerErr) {
    // If the error handler itself throws, log both errors and avoid crashing the process.
    console.error('[errorHandler] failure', {
      originalError: err,
      handlerError: handlerErr && (handlerErr.stack || String(handlerErr))
    });
    // Try to send a minimal response if possible
    if (res && typeof res.status === 'function' && typeof res.json === 'function') {
      try {
        res.status(500).json({ success: false, error: 'Internal server error' });
      } catch (sendErr) {
        // give up silently (we can't do more safely)
      }
    }
  }
}
