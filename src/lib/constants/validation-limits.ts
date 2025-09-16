/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains validation limits and business rules constants.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

/**
 * Contract validation limits
 */
export const CONTRACT_LIMITS = {
  // Title validation
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,

  // Currency code validation
  CURRENCY_CODE_LENGTH: 3,

  // Contract term validation
  TERM_MIN_MONTHS: 1,
  TERM_MAX_MONTHS: 600, // 50 years
  TERM_TYPICAL_MIN_MONTHS: 12,
  TERM_TYPICAL_MAX_MONTHS: 120,

  // Interest rate validation
  INTEREST_RATE_MIN: 0,
  INTEREST_RATE_MAX: 100,
  DISCOUNT_RATE_TYPICAL_MIN: 1,
  DISCOUNT_RATE_TYPICAL_MAX: 25,

  // Payment validation
  PAYMENT_MIN: 0,
  PAYMENT_MAX_REASONABLE: 1000000, // R$ 1,000,000

  // Financial ratios
  RESIDUAL_VALUE_MAX_RATIO: 0.3, // 30% of total payments
  PURCHASE_OPTION_MAX_RATIO: 0.5, // 50% of total payments
  PURCHASE_OPTION_FINANCE_LEASE_RATIO: 0.1, // 10% suggests finance lease

  // Renewal probability
  RENEWAL_PROBABILITY_THRESHOLD: 50, // 50% threshold for short-term exception
} as const;

/**
 * IFRS 16 Exception thresholds
 */
export const IFRS16_EXCEPTION_THRESHOLDS = {
  // Short-term lease exception
  SHORT_TERM_MAX_MONTHS: 12,

  // Low-value asset thresholds by currency
  LOW_VALUE_THRESHOLDS: {
    BRL: 5000, // R$ 5,000
    USD: 1000, // $1,000
    EUR: 1000, // €1,000
    GBP: 1000, // £1,000
    JPY: 100000, // ¥100,000
    CAD: 1000, // C$1,000
    AUD: 1000, // A$1,000
    CHF: 1000, // CHF 1,000
    DEFAULT: 1000, // Default threshold
  },
} as const;

/**
 * UI and UX constants
 */
export const UI_CONSTANTS = {
  // Toast duration
  TOAST_DURATION: 5000, // 5 seconds

  // Animation durations
  ANIMATION_DURATION_SHORT: 100,
  ANIMATION_DURATION_MEDIUM: 300,
  ANIMATION_DURATION_LONG: 500,

  // Progress bar
  PROGRESS_BAR_MAX: 100,

  // Z-index layers
  Z_INDEX_TOAST: 50,
  Z_INDEX_MODAL: 100,
  Z_INDEX_DROPDOWN: 200,
} as const;

/**
 * Cache and performance constants
 */
export const PERFORMANCE_CONSTANTS = {
  // Component cache
  CACHE_MAX_SIZE: 100,
  CACHE_TTL_MINUTES: 5,
  CACHE_MAX_AGE_MINUTES: 30,

  // Telemetry
  TELEMETRY_BATCH_SIZE: 100,
  TELEMETRY_COOLDOWN_SECONDS: 600, // 10 minutes
  MEMORY_THRESHOLD_MB: 100,

  // Debounce delays
  SEARCH_DEBOUNCE_MS: 300,
  FORM_DEBOUNCE_MS: 500,
} as const;

/**
 * Business metrics constants
 */
export const BUSINESS_METRICS_CONSTANTS = {
  // Conversion rates
  PERCENTAGE_MULTIPLIER: 100,

  // Scoring thresholds
  SCORE_EXCELLENT: 75,
  SCORE_GOOD: 50,
  SCORE_WARNING: 25,

  // Time periods
  MONTHS_PER_YEAR: 12,
  DAYS_PER_YEAR: 365,
  DAYS_PER_MONTH: 30,

  // Audit intervals
  AUDIT_INTERVAL_DAYS: 90,
} as const;

/**
 * ESG and sustainability constants
 */
export const ESG_CONSTANTS = {
  // Score ranges
  SCORE_MIN: 0,
  SCORE_MAX: 100,
  SCORE_BASE: 50,

  // Environmental targets
  CARBON_INTENSITY_TARGET: 50, // kg CO2 per R$ 1000 revenue
  WATER_CONSERVATION_TARGET: 100,

  // Multipliers
  CARBON_MULTIPLIER: 1000,
  PRECISION_DECIMALS: 100,
} as const;

/**
 * Blockchain and transparency constants
 */
export const BLOCKCHAIN_CONSTANTS = {
  // Integrity scoring
  INTEGRITY_SCORE_MAX: 100,
  INTEGRITY_SCORE_PERFECT: 100,

  // Verification thresholds
  VERIFICATION_THRESHOLD: 0.8, // 80% verified transactions
} as const;

/**
 * AI automation constants
 */
export const AI_AUTOMATION_CONSTANTS = {
  // Confidence levels
  CONFIDENCE_MAX: 100,
  CONFIDENCE_HIGH: 80,
  CONFIDENCE_MEDIUM: 50,

  // Risk scoring
  RISK_SCORE_HIGH: 50,
  RISK_SCORE_MEDIUM: 25,
  RISK_SCORE_LOW: 10,

  // Time calculations
  MILLISECONDS_PER_DAY: 24 * 60 * 60 * 1000,

  // High value threshold
  HIGH_VALUE_THRESHOLD: 100000, // R$ 100,000
} as const;

/**
 * Sensitivity analysis constants
 */
export const SENSITIVITY_CONSTANTS = {
  // Scenario probabilities
  EARLY_TERMINATION_PROBABILITY: 5,
  MARKET_CRASH_PROBABILITY: 3,

  // Rate adjustments
  MARKET_CRASH_RATE_INCREASE: 5, // 5 percentage points

  // Term reductions
  EARLY_TERMINATION_MONTHS: 12,
} as const;

/**
 * Date and time constants
 */
export const DATE_CONSTANTS = {
  // Common time periods in milliseconds
  MILLISECONDS_PER_SECOND: 1000,
  MILLISECONDS_PER_MINUTE: 60 * 1000,
  MILLISECONDS_PER_HOUR: 60 * 60 * 1000,
  MILLISECONDS_PER_DAY: 24 * 60 * 60 * 1000,
  MILLISECONDS_PER_WEEK: 7 * 24 * 60 * 60 * 1000,
  MILLISECONDS_PER_MONTH: 30 * 24 * 60 * 60 * 1000,
  MILLISECONDS_PER_YEAR: 365 * 24 * 60 * 60 * 1000,

  // Date tolerance
  DATE_TOLERANCE_DAYS: 1,
} as const;

/**
 * Error and validation constants
 */
export const VALIDATION_CONSTANTS = {
  // Date consistency
  DATE_TOLERANCE_MONTHS: 1,

  // Asset type validation
  BUILDING_ASSET_TYPES: ['real_estate', 'building', 'property'],

  // Threshold multipliers
  THRESHOLD_DOUBLE_CHECK: 2,
} as const;
