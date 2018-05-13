import 'jest'
import * as Sinon from 'sinon'
import { Facade, FacadeContainer } from 'najs-facade'
import { Najs } from '../../lib/constants'
import { RedisClient } from '../../lib/redis/RedisClient'
import { RedisPromise } from '../../lib/redis/RedisPromise'
import { ClassRegistry } from 'najs-binding'
import { isPromise } from '../../lib/private/isPromise'
import { ConfigurationKeys } from '../../lib/constants'
import { ConfigFacade } from '../../lib/facades/global/ConfigFacade'

describe('RedisClient', function() {
  let redisClient: RedisClient
  beforeAll(function() {
    redisClient = new RedisClient()
  })

  it('extends from Facade so it definitely a FacadeClass', function() {
    expect(redisClient).toBeInstanceOf(Facade)
    expect(redisClient.getClassName()).toEqual(Najs.Redis.RedisClient)
    expect(ClassRegistry.has(Najs.Redis.RedisClient)).toBe(true)
  })

  describe('constructor()', function() {
    it('calls createClient() with default and config get from ConfigFacade', function() {
      ConfigFacade.shouldReceive('get').withArgs(ConfigurationKeys.Redis, {
        host: 'localhost',
        port: 6379
      })
      const newRedisClient = new RedisClient()
      expect(newRedisClient.getCurrentClient()).toEqual('default')
      FacadeContainer.verifyAndRestoreAllFacades()
    })
  })

  describe('.createClient()', function() {
    it('creates new client and put into bucket if the name is not exists', function() {
      redisClient.createClient('test', {
        host: 'localhost',
        port: 6379
      })
      expect(typeof redisClient['bucket']['test'] === 'object').toBe(true)
    })

    it('does not creates new client the name is exists', function() {
      redisClient.createClient('default', {
        host: 'localhost',
        port: 6379
      })
      expect(redisClient.getCurrentClient()).toEqual('default')
    })

    it('always return created/existing client', function() {
      expect(
        redisClient.createClient('test', {
          host: 'localhost',
          port: 6379
        }) === redisClient['bucket']['test']
      ).toBe(true)
      expect(redisClient.getCurrentClient()).toEqual('default')
    })
  })

  describe('.useClient()', function() {
    it('sets currentBucket to the name if it exists', function() {
      expect(redisClient.useClient('test').getCurrentClient()).toEqual('test')
      expect(redisClient.useClient('default').getCurrentClient()).toEqual('default')
    })

    it('throws an Error if the name is not in bucket list', function() {
      try {
        redisClient.useClient('test-not-found')
      } catch (error) {
        expect(error.message).toEqual('RedisClient "test-not-found" is not found')
        return
      }
      expect('should not reach this line').toEqual('hm')
    })
  })

  describe('.getClient()', function() {
    it('returns RedisPromise instance which wraps native RedisClient', function() {
      const redis = redisClient.getClient('test')
      expect(redis).toBeInstanceOf(RedisPromise)
      expect(redis['redisClient'] === redisClient['bucket']['test']).toBe(true)
    })

    it('creates create instance once time and returns the cache in next time called', function() {
      expect(redisClient['redisPromiseBucket']['test']).not.toBeUndefined()
      expect(redisClient.getClient('test') === redisClient['redisPromiseBucket']['test']).toBe(true)
    })
  })

  describe('.getRedisClient()', function() {
    it('returns native redis client if name exists', function() {
      expect(redisClient.getRedisClient('test') === redisClient['bucket']['test']).toBe(true)
    })

    it('throws an Error if the name is not in bucket list', function() {
      try {
        redisClient.getRedisClient('test-not-found')
      } catch (error) {
        expect(error.message).toEqual('RedisClient "test-not-found" is not found')
        return
      }
      expect('should not reach this line').toEqual('hm')
    })
  })

  describe('.getCurrentClient()', function() {
    it('simply returns currentBucket', function() {})
  })

  describe('.hasClient()', function() {
    it('simply returns true if there is client with name in bucket', function() {
      expect(redisClient.hasClient('default')).toBe(true)
      expect(redisClient.hasClient('test')).toBe(true)
      expect(redisClient.hasClient('test-not-found')).toBe(false)
    })
  })

  // -------------------------------------------------------------------------------------------------------------------

  function promisify_test_for(facadeMethod: string, redisMethod: string, args: any[]) {
    describe('.' + facadeMethod + '()', function() {
      it('returns a promise', function() {
        const promisifyStub = Sinon.stub(RedisPromise, 'promisify')
        promisifyStub.callsFake(async function() {})
        expect(isPromise(redisClient[facadeMethod](...args))).toBe(true)
        promisifyStub.restore()
      })

      it('calls RedisPromise.proxify(), passes method name and arguments', async function() {
        const promisifyStub = Sinon.stub(RedisPromise, 'promisify')
        promisifyStub.callsFake(async function() {
          return true
        })
        redisClient[facadeMethod](...args)
        expect(promisifyStub.calledWith(redisMethod)).toBe(true)
        expect(promisifyStub.lastCall.args[1]).toEqual(redisClient['bucket'][redisClient['currentBucket']])
        expect(Array.from(promisifyStub.lastCall.args[2])).toEqual(args)
        promisifyStub.restore()
      })
    })
  }

  promisify_test_for('monitor', 'monitor', [])
  promisify_test_for('info', 'info', [])
  promisify_test_for('info', 'info', ['test'])
  promisify_test_for('ping', 'ping', [])
  promisify_test_for('ping', 'ping', ['test'])
  promisify_test_for('publish', 'publish', ['test', 'value'])
  promisify_test_for('client', 'client', [])
  promisify_test_for('client', 'client', ['test', 'value'])
  promisify_test_for('hmset', 'hmset', ['test'])
  promisify_test_for('hmset', 'hmset', ['test', '0', '1', '2'])
  promisify_test_for('hmset', 'hmset', ['test', 0, 1, 2])
  promisify_test_for('subscribe', 'subscribe', ['channel'])
  promisify_test_for('subscribe', 'subscribe', [['channel', 'another-channel']])
  promisify_test_for('unsubscribe', 'unsubscribe', ['channel'])
  promisify_test_for('unsubscribe', 'unsubscribe', [['channel', 'another-channel']])
  promisify_test_for('psubscribe', 'psubscribe', ['channel'])
  promisify_test_for('psubscribe', 'psubscribe', [['channel', 'another-channel']])
  promisify_test_for('punsubscribe', 'punsubscribe', ['channel'])
  promisify_test_for('punsubscribe', 'punsubscribe', [['channel', 'another-channel']])

  promisify_test_for('auth', 'auth', ['password'])
  promisify_test_for('append', 'append', ['test', 'abc'])

  promisify_test_for('bgrewriteaof', 'bgrewriteaof', [])
  promisify_test_for('bgsave', 'bgsave', [])
  promisify_test_for('bitcount', 'bitcount', ['test'])
  promisify_test_for('bitcount', 'bitcount', ['test', 1, 2])
  promisify_test_for('bitfield', 'bitfield', ['test', 1])
  promisify_test_for('bitfield', 'bitfield', ['test', [1]])
  promisify_test_for('bitfield', 'bitfield', ['test', ['test']])
  promisify_test_for('bitop', 'bitop', ['test', 'a', 'b', 'c', 'd'])
  promisify_test_for('bitpos', 'bitpos', ['test', 1, 0, 2])
  promisify_test_for('blpop', 'blpop', ['test', 'value'])
  promisify_test_for('brpop', 'brpop', ['test', 'value'])
  promisify_test_for('brpoplpush', 'brpoplpush', ['list', 'another-list', 10])

  promisify_test_for('cluster', 'cluster', [])
  promisify_test_for('cluster', 'cluster', ['test', 'value'])
  promisify_test_for('command', 'command', [])
  promisify_test_for('config', 'config', [])
  promisify_test_for('config', 'config', ['test', 'value'])

  promisify_test_for('dbsize', 'dbsize', [])
  promisify_test_for('debug', 'debug', [])
  promisify_test_for('debug', 'debug', ['test', 'value'])
  promisify_test_for('decr', 'decr', ['test'])
  promisify_test_for('decrby', 'decrby', ['test', 1])
  promisify_test_for('del', 'del', [])
  promisify_test_for('del', 'del', ['test', 'value'])
  promisify_test_for('discard', 'discard', [])
  promisify_test_for('dump', 'dump', ['test'])

  promisify_test_for('echo', 'echo', ['test'])
  promisify_test_for('eval', 'eval', [])
  promisify_test_for('eval', 'eval', ['test', 'value'])
  promisify_test_for('evalsha', 'evalsha', [])
  promisify_test_for('evalsha', 'evalsha', ['test', 'value'])
  promisify_test_for('exists', 'exists', [])
  promisify_test_for('exists', 'exists', ['test', 'value'])
  promisify_test_for('expire', 'expire', ['test', 12])
  promisify_test_for('expireat', 'expireat', ['test', 1212121212])

  promisify_test_for('flushall', 'flushall', [])
  promisify_test_for('flushdb', 'flushdb', [])

  promisify_test_for('geoadd', 'geoadd', [])
  promisify_test_for('geoadd', 'geoadd', ['test'])
  promisify_test_for('geoadd', 'geoadd', ['test', 'value'])
  promisify_test_for('geoadd', 'geoadd', ['test', 0])
  promisify_test_for('geoadd', 'geoadd', ['test', 0, 1])
  promisify_test_for('geoadd', 'geoadd', ['test', 0, 1, 2])
  promisify_test_for('geohash', 'geohash', [])
  promisify_test_for('geohash', 'geohash', ['test'])
  promisify_test_for('geohash', 'geohash', ['test', 'value'])
  promisify_test_for('geohash', 'geohash', ['test', '0'])
  promisify_test_for('geohash', 'geohash', ['test', '0', '1'])
  promisify_test_for('geohash', 'geohash', ['test', '0', '1', '2'])
  promisify_test_for('geopos', 'geopos', [])
  promisify_test_for('geopos', 'geopos', ['test'])
  promisify_test_for('geopos', 'geopos', ['test', 'value'])
  promisify_test_for('geopos', 'geopos', ['test', '0'])
  promisify_test_for('geopos', 'geopos', ['test', '0', '1'])
  promisify_test_for('geopos', 'geopos', ['test', '0', '1', '2'])
  promisify_test_for('geodist', 'geodist', [])
  promisify_test_for('geodist', 'geodist', ['test'])
  promisify_test_for('geodist', 'geodist', ['test', 'value'])
  promisify_test_for('geodist', 'geodist', ['test', '0'])
  promisify_test_for('geodist', 'geodist', ['test', '0', '1'])
  promisify_test_for('geodist', 'geodist', ['test', '0', '1', '2'])
  promisify_test_for('georadius', 'georadius', [])
  promisify_test_for('georadius', 'georadius', ['test'])
  promisify_test_for('georadius', 'georadius', ['test', 'value'])
  promisify_test_for('georadius', 'georadius', ['test', 0])
  promisify_test_for('georadius', 'georadius', ['test', 0, 1])
  promisify_test_for('georadius', 'georadius', ['test', 0, 1, 2])
  promisify_test_for('georadiusbymember', 'georadiusbymember', [])
  promisify_test_for('georadiusbymember', 'georadiusbymember', ['test'])
  promisify_test_for('georadiusbymember', 'georadiusbymember', ['test', 'value'])
  promisify_test_for('georadiusbymember', 'georadiusbymember', ['test', 0])
  promisify_test_for('georadiusbymember', 'georadiusbymember', ['test', 0, 1])
  promisify_test_for('georadiusbymember', 'georadiusbymember', ['test', 0, 1, 2])
  promisify_test_for('get', 'get', ['test'])
  promisify_test_for('getbit', 'getbit', ['test', 7])
  promisify_test_for('getrange', 'getrange', ['test', 0, 3])
  promisify_test_for('getset', 'getset', ['test', 'value'])

  promisify_test_for('hdel', 'hdel', [])
  promisify_test_for('hdel', 'hdel', ['test'])
  promisify_test_for('hdel', 'hdel', ['test', 'value'])
  promisify_test_for('hdel', 'hdel', ['test', 0])
  promisify_test_for('hdel', 'hdel', ['test', 0, 1])
  promisify_test_for('hdel', 'hdel', ['test', 0, 1, 2])
  promisify_test_for('hexists', 'hexists', ['test', 'value'])
  promisify_test_for('hget', 'hget', ['test', 'value'])
  promisify_test_for('hgetall', 'hgetall', ['test'])
  promisify_test_for('hincrby', 'hincrby', ['test', 'value', 3])
  promisify_test_for('hincrbyfloat', 'hincrbyfloat', ['test', 'value', 3.0])
  promisify_test_for('hkeys', 'hkeys', ['test'])
  promisify_test_for('hlen', 'hlen', ['test'])
  promisify_test_for('hmget', 'hmget', [])
  promisify_test_for('hmget', 'hmget', ['test'])
  promisify_test_for('hmget', 'hmget', ['test', 'value'])
  promisify_test_for('hmget', 'hmget', ['test', 0])
  promisify_test_for('hmget', 'hmget', ['test', 0, 1])
  promisify_test_for('hmget', 'hmget', ['test', 0, 1, 2])
  promisify_test_for('hmget', 'hmget', ['test', 'value', 'value'])
  promisify_test_for('hset', 'hset', ['test', 'value', 'value'])
  promisify_test_for('hsetnx', 'hsetnx', ['test', 'value', 'value'])
  promisify_test_for('hstrlen', 'hstrlen', ['test', 'value'])
  promisify_test_for('hvals', 'hvals', ['test'])

  promisify_test_for('incr', 'incr', ['test'])
  promisify_test_for('incrby', 'incrby', ['test', 3])
  promisify_test_for('incrbyfloat', 'incrbyfloat', ['test', 3.0])

  promisify_test_for('keys', 'keys', ['test'])

  promisify_test_for('lastsave', 'lastsave', [])
  promisify_test_for('lindex', 'lindex', ['test', 1])
  promisify_test_for('linsert', 'linsert', ['test', 'AFTER', 'test', 'value'])
  promisify_test_for('llen', 'llen', ['test'])
  promisify_test_for('lpop', 'lpop', ['test'])
  promisify_test_for('lpush', 'lpush', [])
  promisify_test_for('lpush', 'lpush', ['test'])
  promisify_test_for('lpush', 'lpush', ['test', 'value'])
  promisify_test_for('lpush', 'lpush', ['test', 0])
  promisify_test_for('lpush', 'lpush', ['test', 0, 1])
  promisify_test_for('lpush', 'lpush', ['test', 0, 1, 2])
  promisify_test_for('lpush', 'lpush', ['test', 'value', 'value'])
  promisify_test_for('lpushx', 'lpushx', ['lpushx', 'value'])
  promisify_test_for('lrange', 'lrange', ['test', 0, 1])
  promisify_test_for('lrem', 'lrem', ['test', 1, 'value'])
  promisify_test_for('lset', 'lset', ['test', 1, 'value'])
  promisify_test_for('ltrim', 'ltrim', ['test', 1, 2])

  promisify_test_for('mget', 'mget', [])
  promisify_test_for('mget', 'mget', ['test', 'value'])
  promisify_test_for('migrate', 'migrate', [])
  promisify_test_for('migrate', 'migrate', ['test', 'value'])
  promisify_test_for('move', 'move', ['test', 1])
  promisify_test_for('mset', 'mset', [])
  promisify_test_for('mset', 'mset', ['test', 'value'])
  promisify_test_for('msetnx', 'msetnx', [])
  promisify_test_for('msetnx', 'msetnx', ['test', 'value'])

  promisify_test_for('object', 'object', [])
  promisify_test_for('object', 'object', ['test', 'value'])

  promisify_test_for('persist', 'persist', ['test'])
  promisify_test_for('pexpire', 'pexpire', ['test', 1])
  promisify_test_for('pexpireat', 'pexpireat', ['test', 1])
  promisify_test_for('pfadd', 'pfadd', [])
  promisify_test_for('pfadd', 'pfadd', ['test'])
  promisify_test_for('pfadd', 'pfadd', ['test', 'value'])
  promisify_test_for('pfadd', 'pfadd', ['test', 0])
  promisify_test_for('pfadd', 'pfadd', ['test', 0, 1])
  promisify_test_for('pfadd', 'pfadd', ['test', 0, 1, 2])
  promisify_test_for('pfadd', 'pfadd', ['test', 'value', 'value'])
  promisify_test_for('pfcount', 'pfcount', [])
  promisify_test_for('pfcount', 'pfcount', ['test', 'value'])
  promisify_test_for('pfmerge', 'pfmerge', [])
  promisify_test_for('pfmerge', 'pfmerge', ['test', 'value'])
  promisify_test_for('psetex', 'psetex', ['test', 1, 'value'])
  promisify_test_for('pubsub', 'pubsub', [])
  promisify_test_for('pubsub', 'pubsub', ['test', 'value'])
  promisify_test_for('pttl', 'pttl', ['test'])

  promisify_test_for('quit', 'quit', [])

  promisify_test_for('randomkey', 'randomkey', [])
  promisify_test_for('readonly', 'readonly', [])
  promisify_test_for('readwrite', 'readwrite', [])
  promisify_test_for('rename', 'rename', ['test', 'test-new'])
  promisify_test_for('renamenx', 'renamenx', ['test', 'test-new'])
  promisify_test_for('restore', 'restore', ['test', 1, 'value'])
  promisify_test_for('role', 'role', [])
  promisify_test_for('rpop', 'rpop', ['test'])
  promisify_test_for('rpoplpush', 'rpoplpush', ['test', 'value'])
  promisify_test_for('rpush', 'rpush', [])
  promisify_test_for('rpush', 'rpush', ['test'])
  promisify_test_for('rpush', 'rpush', ['test', 'value'])
  promisify_test_for('rpush', 'rpush', ['test', 0])
  promisify_test_for('rpush', 'rpush', ['test', 0, 1])
  promisify_test_for('rpush', 'rpush', ['test', 0, 1, 2])
  promisify_test_for('rpush', 'rpush', ['test', 'value', 'value'])
  promisify_test_for('rpushx', 'rpushx', ['test', 'value'])

  promisify_test_for('sadd', 'sadd', [])
  promisify_test_for('sadd', 'sadd', ['test'])
  promisify_test_for('sadd', 'sadd', ['test', 'value'])
  promisify_test_for('sadd', 'sadd', ['test', 0])
  promisify_test_for('sadd', 'sadd', ['test', 0, 1])
  promisify_test_for('sadd', 'sadd', ['test', 0, 1, 2])
  promisify_test_for('sadd', 'sadd', ['test', 'value', 'value'])
  promisify_test_for('save', 'save', [])
  promisify_test_for('scard', 'scard', ['test'])
  promisify_test_for('script', 'script', [])
  promisify_test_for('script', 'script', ['test', 'value'])
  promisify_test_for('sdiff', 'sdiff', [])
  promisify_test_for('sdiff', 'sdiff', ['test', 'value'])
  promisify_test_for('sdiffstore', 'sdiffstore', [])
  promisify_test_for('sdiffstore', 'sdiffstore', ['test'])
  promisify_test_for('sdiffstore', 'sdiffstore', ['test', 'value'])
  promisify_test_for('sdiffstore', 'sdiffstore', ['test', 0])
  promisify_test_for('sdiffstore', 'sdiffstore', ['test', 0, 1])
  promisify_test_for('sdiffstore', 'sdiffstore', ['test', 0, 1, 2])
  promisify_test_for('sdiffstore', 'sdiffstore', ['test', 'value', 'value'])
  promisify_test_for('select', 'select', ['test'])
  promisify_test_for('select', 'select', [0])
  promisify_test_for('set', 'set', ['test', 'value'])
  promisify_test_for('set', 'set', ['test', 'value', 'any'])
  promisify_test_for('set', 'set', ['test', 'value', 'any', 12])
  promisify_test_for('set', 'set', ['test', 'value', 'any', 12, 'any'])
  promisify_test_for('setbit', 'setbit', ['test', 0, '1'])
  promisify_test_for('setex', 'setex', ['test', 12, 'value'])
  promisify_test_for('setnx', 'setnx', ['test', 'value'])
  promisify_test_for('setrange', 'setrange', ['test', 0, 'value'])
  promisify_test_for('shutdown', 'shutdown', [])
  promisify_test_for('shutdown', 'shutdown', ['test', 'value'])
  promisify_test_for('sinter', 'sinter', [])
  promisify_test_for('sinter', 'sinter', ['test'])
  promisify_test_for('sinter', 'sinter', ['test', 'value'])
  promisify_test_for('sinter', 'sinter', ['test', 0])
  promisify_test_for('sinter', 'sinter', ['test', 0, 1])
  promisify_test_for('sinter', 'sinter', ['test', 0, 1, 2])
  promisify_test_for('sinter', 'sinter', ['test', 'value', 'value'])
  promisify_test_for('sinterstore', 'sinterstore', [])
  promisify_test_for('sinterstore', 'sinterstore', ['test', 'value'])
  promisify_test_for('sismember', 'sismember', ['test', 'member'])
  promisify_test_for('slaveof', 'slaveof', ['localhost', '6666'])
  promisify_test_for('slowlog', 'slowlog', [])
  promisify_test_for('slowlog', 'slowlog', ['test', 'value'])
  promisify_test_for('smembers', 'smembers', ['test'])
  promisify_test_for('smove', 'smove', ['source', 'destination', 'test'])
  promisify_test_for('sort', 'sort', [])
  promisify_test_for('sort', 'sort', ['test', 'value'])
  promisify_test_for('spop', 'spop', ['test'])
  promisify_test_for('spop', 'spop', ['test', 2])
  promisify_test_for('srandmember', 'srandmember', ['test'])
  promisify_test_for('srandmember', 'srandmember', ['test', 2])
  promisify_test_for('srem', 'srem', [])
  promisify_test_for('srem', 'srem', ['test'])
  promisify_test_for('srem', 'srem', ['test', 'value'])
  promisify_test_for('srem', 'srem', ['test', 0])
  promisify_test_for('srem', 'srem', ['test', 0, 1])
  promisify_test_for('srem', 'srem', ['test', 0, 1, 2])
  promisify_test_for('srem', 'srem', ['test', 'value', 'value'])
  promisify_test_for('strlen', 'strlen', ['test'])
  promisify_test_for('sunion', 'sunion', [])
  promisify_test_for('sunion', 'sunion', ['test', 'value'])
  promisify_test_for('sunionstore', 'sunionstore', [])
  promisify_test_for('sunionstore', 'sunionstore', ['test', 'value'])
  promisify_test_for('sync', 'sync', [])

  promisify_test_for('time', 'time', [])
  promisify_test_for('ttl', 'ttl', ['test'])
  promisify_test_for('type', 'type', ['test'])

  promisify_test_for('unwatch', 'unwatch', [])
  promisify_test_for('wait', 'wait', [1, 10000])
  promisify_test_for('watch', 'watch', [])
  promisify_test_for('watch', 'watch', ['test', 'value'])

  promisify_test_for('zadd', 'zadd', [])
  promisify_test_for('zadd', 'zadd', ['test'])
  promisify_test_for('zadd', 'zadd', ['test', 'value'])
  promisify_test_for('zadd', 'zadd', ['test', 0])
  promisify_test_for('zadd', 'zadd', ['test', 0, 1])
  promisify_test_for('zadd', 'zadd', ['test', 0, 1, 2])
  promisify_test_for('zadd', 'zadd', ['test', 'value', 'value'])
  promisify_test_for('zcard', 'zcard', ['test'])
  promisify_test_for('zcount', 'zcount', ['test', 1, 3])
  promisify_test_for('zcount', 'zcount', ['test', '1', '3'])
  promisify_test_for('zincrby', 'zincrby', ['test', 1, 'member'])
  promisify_test_for('zinterstore', 'zinterstore', [])
  promisify_test_for('zinterstore', 'zinterstore', ['test', 'value'])
  promisify_test_for('zlexcount', 'zlexcount', ['test', 'min', 'max'])
  promisify_test_for('zrange', 'zrange', ['test', 0, 1])
  promisify_test_for('zrange', 'zrange', ['test', 0, 1, 'score'])
  promisify_test_for('zrevrangebylex', 'zrevrangebylex', ['test', 1, 2])
  promisify_test_for('zrevrangebylex', 'zrevrangebylex', ['test', 1, 2, 'limit', 0, 1])
  promisify_test_for('zrangebylex', 'zrangebylex', ['test', 1, 2])
  promisify_test_for('zrangebylex', 'zrangebylex', ['test', 1, 2, 3, 4, 5])
  promisify_test_for('zrangebyscore', 'zrangebyscore', ['test', 1, 2])
  promisify_test_for('zrangebyscore', 'zrangebyscore', ['test', 'min', 'max'])
  promisify_test_for('zrangebyscore', 'zrangebyscore', ['test', 'min', 'max'])
  promisify_test_for('zrangebyscore', 'zrangebyscore', ['test', 'min', 'max', 'score'])
  promisify_test_for('zrangebyscore', 'zrangebyscore', ['test', 'min', 'max', 'limit', 1, 2])
  promisify_test_for('zrangebyscore', 'zrangebyscore', ['test', 'min', 'max', 'limit', 1, 2, 3])
  promisify_test_for('zrank', 'zrank', ['test', 'member'])
  promisify_test_for('zrem', 'zrem', [])
  promisify_test_for('zrem', 'zrem', ['test'])
  promisify_test_for('zrem', 'zrem', ['test', 'value'])
  promisify_test_for('zrem', 'zrem', ['test', 0])
  promisify_test_for('zrem', 'zrem', ['test', 0, 1])
  promisify_test_for('zrem', 'zrem', ['test', 0, 1, 2])
  promisify_test_for('zrem', 'zrem', ['test', 'value', 'value'])
  promisify_test_for('zremrangebylex', 'zremrangebylex', ['test', 1, 2])
  promisify_test_for('zremrangebyrank', 'zremrangebyrank', ['test', 1, 2])
  promisify_test_for('zremrangebyscore', 'zremrangebyscore', ['test', 1, 2])
  promisify_test_for('zremrangebyscore', 'zremrangebyscore', ['test', 'min', 'max'])
  promisify_test_for('zrevrange', 'zrevrange', ['test', 1, 2])
  promisify_test_for('zrevrange', 'zrevrange', ['test', 1, 2, 'score'])
  promisify_test_for('zrevrangebyscore', 'zrevrangebyscore', ['test', 1, 2])
  promisify_test_for('zrevrangebyscore', 'zrevrangebyscore', ['test', 1, 2, 'score'])
  promisify_test_for('zrevrangebyscore', 'zrevrangebyscore', ['test', 1, 2, 'limit', 0, 1])
  promisify_test_for('zrevrangebyscore', 'zrevrangebyscore', ['test', 1, 2, 'score', 'limit', 0, 1])
  promisify_test_for('zrevrank', 'zrevrank', ['test', 'member'])
  promisify_test_for('zscore', 'zscore', ['test', 'member'])
  promisify_test_for('zunionstore', 'zunionstore', [])
  promisify_test_for('zunionstore', 'zunionstore', ['test', 'value'])

  promisify_test_for('scan', 'scan', [])
  promisify_test_for('scan', 'scan', ['test', 'value'])
  promisify_test_for('sscan', 'sscan', [])
  promisify_test_for('sscan', 'sscan', ['test'])
  promisify_test_for('sscan', 'sscan', ['test', 'value'])
  promisify_test_for('sscan', 'sscan', ['test', 0])
  promisify_test_for('sscan', 'sscan', ['test', 0, 1])
  promisify_test_for('sscan', 'sscan', ['test', 0, 1, 2])
  promisify_test_for('sscan', 'sscan', ['test', 'value', 'value'])
  promisify_test_for('hscan', 'hscan', [])
  promisify_test_for('hscan', 'hscan', ['test'])
  promisify_test_for('hscan', 'hscan', ['test', 'value'])
  promisify_test_for('hscan', 'hscan', ['test', 0])
  promisify_test_for('hscan', 'hscan', ['test', 0, 1])
  promisify_test_for('hscan', 'hscan', ['test', 0, 1, 2])
  promisify_test_for('hscan', 'hscan', ['test', 'value', 'value'])
  promisify_test_for('zscan', 'zscan', [])
  promisify_test_for('zscan', 'zscan', ['test'])
  promisify_test_for('zscan', 'zscan', ['test', 'value'])
  promisify_test_for('zscan', 'zscan', ['test', 0])
  promisify_test_for('zscan', 'zscan', ['test', 0, 1])
  promisify_test_for('zscan', 'zscan', ['test', 0, 1, 2])
  promisify_test_for('zscan', 'zscan', ['test', 'value', 'value'])
})
