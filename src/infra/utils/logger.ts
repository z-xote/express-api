// src/utils/logger.ts
import winston from 'winston';
import chalk from 'chalk';

// Define log level colors and labels
const LOG_LEVEL_CONFIG = {
  error: { color: chalk.redBright, label: 'error' },
  warn: { color: chalk.yellowBright, label: 'warning' },
  info: { color: chalk.cyanBright, label: 'info' },
  debug: { color: chalk.magentaBright, label: 'debug' },
  verbose: { color: chalk.gray, label: 'verbose' }
};

// Add custom success level
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    success: 3,
    debug: 4,
    verbose: 5
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    success: 'green',
    debug: 'magenta',
    verbose: 'gray'
  }
};



// Colorize JSON with chalk for pretty printing
const colorizeJson = (jsonString: string, indent = 2): string => {
  // ── palette ──────────────────────────────────────────────
  const keyName      = chalk.hex('#df3079');            // text fields
  const keyQuote     = chalk.hex('#d6d4d4');            // the " characters around the key
  const braces       = chalk.hex('#d6d4d4');            // { } [ ]
  const colon        = chalk.hex('#d6d4d4');            // :
  const comma        = chalk.hex('#d6d4d4');            // ,
  const quotedVal    = chalk.hex('#00a67d');            // (green) anything inside "…" or '…'
  const numberVal    = chalk.hex('#688087');            // (sky gray) bare numbers 
  const boolVal      = chalk.hex('#2e95d3');            // (blue) booleans
  const nullVal      = chalk.hex('#2e95d3');            // (blue) null

  // ── helpers ──────────────────────────────────────────────
  /** colour just the key correctly */
  const colourKey = (k: string) =>
    keyQuote('"') + keyName(k) + keyQuote('"');

  /** recursive pretty-printer */
  const colourValue = (value: any, depth: number): string => {
    const pad = ' '.repeat(indent * depth);
    const padNext = ' '.repeat(indent * (depth + 1));

    if (value === null)            return nullVal('null');
    if (typeof value === 'string') return quotedVal(JSON.stringify(value));
    if (typeof value === 'number') return numberVal(String(value));
    if (typeof value === 'boolean')return boolVal(String(value));

    if (Array.isArray(value)) {
      if (value.length === 0) return braces('[]');
      const inner = value
        .map(v => `${padNext}${colourValue(v, depth + 1)}`)
        .join(comma(',\n'));
      return braces('[\n') + inner + '\n' + pad + braces(']');
    }

    // object
    const entries = Object.entries(value);
    if (entries.length === 0) return braces('{}');
    const inner = entries
      .map(([k, v]) =>
        `${padNext}${colourKey(k)}${colon(': ')}${colourValue(v, depth + 1)}`
      )
      .join(comma(',\n'));
    return braces('{\n') + inner + '\n' + pad + braces('}');
  };

  // ── parse & colour ───────────────────────────────────────
  let parsed: any;
  try {
    parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch {
    return chalk.redBright('<< invalid JSON >> ') + jsonString;
  }
  return colourValue(parsed, 0);
};


// Handle metadata with conditional pretty printing
const handleMetadata = (metadata: Record<string, any>): string => {
  if (Object.keys(metadata).length === 0) return '';
  
  // Check if pretty printing is requested
  const shouldPrettyPrint = metadata.prettyPrint === true;
  
  // Handle common metadata in a clean way first
  let msg = '';
  const handled = new Set<string>(['prettyPrint', 'module']); // Always handle these flags
  
  if (metadata.version) {
    msg += ` ${chalk.yellow(`(${chalk.yellowBright(`v${metadata.version}`)})`)}`;
    handled.add('version');
  }
  if (metadata.port) {
    msg += ` on port ${metadata.port}`;
    handled.add('port');
  }
  if (metadata.error) {
    msg += ` - ${chalk.red(metadata.error)}`;
    handled.add('error');
  }
  if (metadata.healthCheck) {
    msg += ` → ${chalk.green(metadata.healthCheck)}`;
    handled.add('healthCheck');
  }
  if (metadata.duration) {
    msg += ` ${chalk.dim(`(${metadata.duration})`)}`;
    handled.add('duration');
  }
  if (metadata.statusCode) {
    const statusColor = metadata.statusCode >= 400 ? chalk.red : 
                       metadata.statusCode >= 300 ? chalk.yellow : chalk.green;
    msg += ` ${statusColor(metadata.statusCode)}`;
    handled.add('statusCode');
  }
  
  // Get remaining metadata
  const remaining = Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !handled.has(key))
  );
  
  // Handle remaining metadata based on prettyPrint flag
  if (Object.keys(remaining).length > 0) {
    if (shouldPrettyPrint) {
      // Pretty print with colorized JSON
      const jsonString = JSON.stringify(remaining, null, 2);
      msg += '\n' + colorizeJson(jsonString);
    } else {
      // Compact JSON on same line with gray color
      const jsonString = JSON.stringify(remaining);
      msg += ` ${chalk.gray(jsonString)}`;
    }
  }
  
  return msg;
};

// Enhanced format with proper log level coloring
const consoleFormat = winston.format.printf(({ level, message, module, ...metadata }) => {
  let msg = '';
  
  // Add module prefix if present
  if (module) {
    msg += `${chalk.blueBright(`(${module})`)}:`;
  }
  
  // Add colored log level indicator
  const levelConfig = LOG_LEVEL_CONFIG[level as keyof typeof LOG_LEVEL_CONFIG];
  if (levelConfig) {
    msg += `${levelConfig.color(`[${levelConfig.label}]`)} `;
  } else {
    // Fallback for unknown levels
    msg += `${chalk.white(`[${level}]`)} `;
  }
  
  // Add the main message
  msg += message;
  
  // Handle metadata with conditional pretty printing
  msg += handleMetadata(metadata);
  
  return msg;
});

// Create the main logger with custom levels
export const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.errors({ stack: true })
  ),
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

// Add colors to winston
winston.addColors(customLevels.colors);

// Create child loggers for each module with typed methods
export const createLogger = (module: string) => {
  const childLogger = logger.child({ module });
  
  // Add typed methods for better IDE support
  return {
    error: (message: string, metadata?: Record<string, any>) => 
      childLogger.error(message, metadata),
    warn: (message: string, metadata?: Record<string, any>) => 
      childLogger.warn(message, metadata),
    warning: (message: string, metadata?: Record<string, any>) => 
      childLogger.warn(message, metadata), // Alias for warn
    info: (message: string, metadata?: Record<string, any>) => 
      childLogger.info(message, metadata),
    success: (message: string, metadata?: Record<string, any>) => 
      childLogger.log('success', message, metadata),
    debug: (message: string, metadata?: Record<string, any>) => 
      childLogger.debug(message, metadata),
    verbose: (message: string, metadata?: Record<string, any>) => 
      childLogger.verbose(message, metadata),
  };
};

// Export the main logger with success method
export const mainLogger = {
  error: (message: string, metadata?: Record<string, any>) => 
    logger.error(message, metadata),
  warn: (message: string, metadata?: Record<string, any>) => 
    logger.warn(message, metadata),
  warning: (message: string, metadata?: Record<string, any>) => 
    logger.warn(message, metadata),
  info: (message: string, metadata?: Record<string, any>) => 
    logger.info(message, metadata),
  success: (message: string, metadata?: Record<string, any>) => 
    logger.log('success', message, metadata),
  debug: (message: string, metadata?: Record<string, any>) => 
    logger.debug(message, metadata),
  verbose: (message: string, metadata?: Record<string, any>) => 
    logger.verbose(message, metadata),
};


/*

- hide mesh json 
- hide pretty json 
- config database controller
- express-api tag color changed
- proper color definitions

*/