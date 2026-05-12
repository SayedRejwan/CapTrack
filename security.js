// CapTrack V2.0 — Security Utilities
// Input sanitization, validation, and rate limiting for the client-side app.
// DOMPurify must be loaded before this script (via CDN in index.html).

(function() {
  'use strict';

  // ── Input length limits ──
  const LIMITS = {
    taskTitle: 200,
    commentText: 1000,
    meetingTitle: 200,
    fileName: 100,
    fileSize: 20,
    memberName: 80,
    memberSid: 20,
    memberMobile: 20,
    projectTitle: 200,
    link: 500,
  };
  window.CAPTRACK_LIMITS = LIMITS;

  // ── HTML sanitization ──
  function sanitize(str) {
    if (typeof str !== 'string') return '';
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(str, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    }
    // Fallback if DOMPurify not loaded: strip tags manually
    return str.replace(/<[^>]*>/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Input validation ──
  function validateLength(value, limitName) {
    const limit = LIMITS[limitName] || 200;
    if (typeof value !== 'string') return { ok: false, error: 'Invalid input' };
    const trimmed = value.trim();
    if (!trimmed) return { ok: false, error: 'Required field' };
    if (trimmed.length > limit) return { ok: false, error: `Max ${limit} characters` };
    return { ok: true, value: trimmed };
  }

  // Validate URL: only allow http/https links
  function validateUrl(url) {
    if (typeof url !== 'string') return { ok: false, error: 'Invalid link' };
    const trimmed = url.trim();
    if (!trimmed) return { ok: true, value: '' }; // empty is fine
    // Auto-prefix https:// if missing
    let full = trimmed;
    if (!/^https?:\/\//i.test(full)) full = 'https://' + full;
    try {
      const parsed = new URL(full);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { ok: false, error: 'Only http/https links allowed' };
      }
      if (full.length > LIMITS.link) return { ok: false, error: `Max ${LIMITS.link} characters` };
      return { ok: true, value: full };
    } catch {
      return { ok: false, error: 'Invalid URL' };
    }
  }

  // Validate week number
  function validateWeek(w) {
    const n = Number(w);
    if (isNaN(n) || n < 1 || n > 28) return { ok: false, error: 'Week must be 1-28' };
    return { ok: true, value: n };
  }

  // Sanitize user text for safe display (React handles most XSS, but defense in depth)
  function sanitizeText(str) {
    if (typeof str !== 'string') return '';
    return sanitize(str);
  }

  // ── Login rate limiting ──
  const loginAttempts = { team: {}, sup: { lastReset: Date.now() } };
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

  function checkLoginRate(bucket) {
    const now = Date.now();
    if (now - loginAttempts[bucket].lastReset > LOCKOUT_MS) {
      loginAttempts[bucket] = { count: 0, lastReset: now };
    }
    if (loginAttempts[bucket].count >= MAX_ATTEMPTS) {
      const remainingMs = LOCKOUT_MS - (now - loginAttempts[bucket].lastReset);
      return { ok: false, error: `Too many attempts. Try again in ${Math.ceil(remainingMs / 60000)} min.` };
    }
    return { ok: true };
  }

  function recordLoginAttempt(bucket, success) {
    if (success) {
      loginAttempts[bucket] = { count: 0, lastReset: Date.now() };
    } else {
      if (!loginAttempts[bucket]) loginAttempts[bucket] = { count: 0, lastReset: Date.now() };
      loginAttempts[bucket].count++;
    }
  }

  // ── Expose to window ──
  window.CAPTRACK_SECURITY = {
    sanitize: sanitizeText,
    validateLength,
    validateUrl,
    validateWeek,
    checkLoginRate,
    recordLoginAttempt,
    LIMITS,
  };
})();