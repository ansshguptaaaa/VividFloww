const redis = require('../config/redis');

const blacklistCheck = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown-ip';
    
    // Check if user is in the blacklist
    const isBanned = await redis.get(`banned:${ip}`);

    if (isBanned) {
      console.log(`[Blacklist] Blocked request from banned IP: ${ip}`);
      return res.status(403).json({
        success: false,
        message: 'Your IP has been banned for 24 hours due to excessive requests.',
        error: 'Forbidden'
      });
    }

    next();
  } catch (error) {
    console.error('[BlacklistCheck] Redis Error:', error);
    next();
  }
};

const otpRateLimiter = async (req, res, next) => {
  try {
    // Attempt to get the user's IP, use a fallback if not found
    const ip = req.ip || req.connection.remoteAddress || 'unknown-ip';
    const key = `ratelimit:otp:${ip}`;

    // Increment request count for this IP
    const requests = await redis.incr(key);
    
    console.log(`[RateLimiter] IP: ${ip} | Request Count: ${requests}`);

    if (requests === 1) {
      // Set expiration to 60 seconds on the very first request
      await redis.expire(key, 60);
    }

    if (requests > 5) {
      // Abuse Tracking: Count how many times this user hit the 429 limit
      const abuseKey = `abuse:otp:${ip}`;
      const abuses = await redis.incr(abuseKey);
      
      if (abuses === 1) {
        // Track the abuse count for 1 hour
        await redis.expire(abuseKey, 3600);
      }

      // If they get rated-limited more than 3 times, ban them for 24 hours
      if (abuses >= 3) {
        console.log(`[RateLimiter] IP ${ip} hit 429 more than 3 times! Banning for 24h.`);
        await redis.setex(`banned:${ip}`, 86400, 'true'); // 86400 sec = 24 hours
        
        return res.status(403).json({
          success: false,
          message: 'Your IP has been temporarily banned due to excessive requests.',
          error: 'Forbidden'
        });
      }

      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again after 60 seconds.',
        error: 'Too Many Requests'
      });
    }

    next();
  } catch (error) {
    console.error('[RateLimiter] Redis Error:', error);
    // On Redis failure, skip rate limiting so users can still log in
    next();
  }
};

module.exports = {
  blacklistCheck,
  otpRateLimiter,
};
