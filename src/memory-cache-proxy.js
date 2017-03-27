import cache from 'memory-cache';
import debug from 'debug';

const error = debug('memory-cache-proxy:error');
const info = debug('memory-cache-proxy:info');

export default async (func, cacheOptions, args = []) => {
  info(`${func.name} Cache Proxy`);
  // 检查cacheOptions是否正确
  if (!cacheOptions || !cacheOptions.key || !cacheOptions.expire) {
    error('cacheOptions must be provided.');
    throw new Error('cacheOptions must be provided.');
  }

  // 检查args参数是否是数组
  if (!Array.isArray(args)) {
    error('parameter args must be a array');
    throw new Error('parameter args must be a array');
  }

  try {
    let data = cache.get(cacheOptions.key);

    // 强制刷新或缓存中没有数据，从func获取
    if (cacheOptions.forceFlush || !data) {
      info(`${func.name} get data from cache failed. cacheKey:`, cacheOptions.key);

      data = await func(...args);
      cache.put(cacheOptions.key, data, cacheOptions.expire);
      info('putted data to cache. cacheOptions=', cacheOptions);
    } else {
      info('retrived data from cache. cacheKey=', cacheOptions.key);
    }
    return data;
  } catch (e) {
    error(e.message);
    error(e.stack);
    throw e;
  }
};
