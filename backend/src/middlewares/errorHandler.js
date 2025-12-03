export function errorHandler(err, req, res, next) {
  try {
    if (!err) {
      err = new Error('Unknown server error');
      err.status = 500;
    }

    const status = err?.status || 500;
    const message = err?.message || 'Internal server error';
    const details = err?.details;

    console.error('[errorHandler]', {
      status,
      message,
   
      stack: err?.stack ? String(err.stack).split('\n').slice(0, 6).join('\n') : undefined,
      details: details ?? undefined
    });

    if (!res || typeof res.status !== 'function' || typeof res.json !== 'function') {
      return;
    }

    const body = { success: false, error: message };
    if (details) body.details = details;

    res.status(status).json(body);
  } catch (handlerErr) {
    console.error('[errorHandler] failure', {
      originalError: err,
      handlerError: handlerErr && (handlerErr.stack || String(handlerErr))
    });

    if (res && typeof res.status === 'function' && typeof res.json === 'function') {
      try {
        res.status(500).json({ success: false, error: 'Internal server error' });
      } catch (sendErr) {
        
      }
    }
  }
}
