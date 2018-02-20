import 'jest'
import * as Sinon from 'sinon'
import * as Redis from 'redis'
import { Facade } from '../../lib/facades/Facade'
import { GlobalFacadeClass } from '../../lib/constants'
import { RedisClient } from '../../lib/redis/RedisClient'
import { ClassRegistry } from '../../lib/core/ClassRegistry'
import { isPromise } from '../../lib/private/isPromise'
import { ConfigurationKeys } from '../../lib/constants'
import { ConfigFacade } from '../../lib/facades/global/ConfigFacade'
import { FacadeContainer } from '../../lib/facades/FacadeContainer'

describe('RedisClient', function() {
  it('extends from Facade so it definitely a FacadeClass', function() {
    const redisClient = new RedisClient()
    expect(redisClient).toBeInstanceOf(Facade)
    expect(redisClient.getClassName()).toEqual(GlobalFacadeClass.Redis)
    expect(ClassRegistry.has(GlobalFacadeClass.Redis)).toBe(true)
  })

  describe('constructor()', function() {
    it('calls createClient() with default and config get from ConfigFacade', function() {
      ConfigFacade.shouldReceive('get').withArgs(ConfigurationKeys.Redis, {
        host: 'localhost',
        port: 6379
      })
      const redisClient = new RedisClient()
      expect(redisClient.getCurrentClient()).toEqual('default')
      FacadeContainer.verifyAndRestoreAllFacades()
    })
  })

  describe('.createClient()', function() {
    it('creates new client and put into bucket if the name is not exists', function() {
      const redisClient = new RedisClient()
      redisClient.createClient('test', {
        host: 'localhost',
        port: 6379
      })
      expect(typeof redisClient['bucket']['test'] === 'object').toBe(true)
    })

    it('does not creates new client the name is exists', function() {
      const redisClient = new RedisClient()
      redisClient.createClient('default', {
        host: 'localhost',
        port: 6379
      })
      expect(redisClient.getCurrentClient()).toEqual('default')
      expect(typeof redisClient['bucket']['test'] === 'undefined').toBe(true)
    })

    it('always return created/existing client', function() {
      const redisClient = new RedisClient()
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
      const redisClient = new RedisClient()
      redisClient.createClient('test', {
        host: 'localhost',
        port: 6379
      })
      expect(redisClient.useClient('test').getCurrentClient()).toEqual('test')
      expect(redisClient.useClient('default').getCurrentClient()).toEqual('default')
    })

    it('throws an Error if the name is not in bucket list', function() {
      const redisClient = new RedisClient()
      try {
        redisClient.useClient('test')
      } catch (error) {
        expect(error.message).toEqual('RedisClient "test" is not found')
        return
      }
      expect('should not reach this line').toEqual('hm')
    })
  })

  describe('.getClient()', function() {
    it('returns native redis client if name exists', function() {
      const redisClient = new RedisClient()
      redisClient.createClient('test', {
        host: 'localhost',
        port: 6379
      })
      expect(redisClient.getClient('test') === redisClient['bucket']['test']).toBe(true)
    })

    it('throws an Error if the name is not in bucket list', function() {
      const redisClient = new RedisClient()
      try {
        redisClient.getClient('test')
      } catch (error) {
        expect(error.message).toEqual('RedisClient "test" is not found')
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
      const redisClient = new RedisClient()
      expect(redisClient.hasClient('default')).toBe(true)
      expect(redisClient.hasClient('test')).toBe(false)
    })
  })

  describe('protected .redisClientProxy()', function() {
    it('simply calls RedisClient.prototype[method] with custom callback', function() {
      const redisStub = Sinon.stub(Redis.RedisClient.prototype, 'get')
      const redisClient = new RedisClient()
      expect(isPromise(redisClient['redisClientProxy']('get', ['test']))).toBe(true)
      expect(redisStub.calledWith('test')).toBe(true)
      expect(typeof redisStub.lastCall.args[1] === 'function').toBe(true)
      expect(redisStub.lastCall.thisValue === redisClient['bucket']['default']).toBe(true)
      redisClient.createClient('test', {
        host: 'localhost',
        port: 6379
      })
      redisClient.useClient('test')
      redisClient['redisClientProxy']('get', ['test'])
      expect(redisStub.lastCall.thisValue === redisClient['bucket']['test']).toBe(true)
      redisStub.restore()
    })

    it('calls Promise.resolve if there is no error', async function() {
      const redisClient = new RedisClient()
      const result = await redisClient['redisClientProxy']('append', ['test', 'a'])
      expect(result).toBeGreaterThan(0)
    })

    it('call Promise.reject if there is any error', async function() {
      const redisStub = Sinon.stub(Redis.RedisClient.prototype, 'get')
      try {
        redisStub.callsFake(function(key, done) {
          done(new Error(key))
        })
        const redisClient = new RedisClient()
        await redisClient['redisClientProxy']('get', ['test'])
      } catch (error) {
        expect(error.message).toEqual('test')
        redisStub.restore()
        return
      }
      expect('should not reach this line').toEqual('hm')
    })
  })

  // -------------------------------------------------------------------------------------------------------------------

  function redisClientProxy_test_for(facadeMethod: string, redisMethod: string, args: any[]) {
    describe('.' + facadeMethod + '()', function() {
      it('returns a promise', function() {
        const redisClient = new RedisClient()
        const redisClientProxyStub = Sinon.stub(redisClient, <any>'redisClientProxy')
        redisClientProxyStub.callsFake(async function() {})
        expect(isPromise(redisClient[facadeMethod](...args))).toBe(true)
        redisClientProxyStub.restore()
      })

      it('calls .redisClientProxy(), passes method name and arguments', async function() {
        const redisClient = new RedisClient()
        const redisClientProxyStub = Sinon.stub(redisClient, <any>'redisClientProxy')
        redisClientProxyStub.callsFake(async function() {
          return true
        })
        redisClient[facadeMethod](...args)
        expect(redisClientProxyStub.calledWith(redisMethod)).toBe(true)
        expect(Array.from(redisClientProxyStub.lastCall.args[1])).toEqual(args)
      })
    })
  }

  redisClientProxy_test_for('append', 'append', ['test', 'abc'])

  redisClientProxy_test_for('auth', 'auth', ['password'])

  redisClientProxy_test_for('bgrewriteaof', 'bgrewriteaof', [])
  redisClientProxy_test_for('bgsave', 'bgsave', [])
  redisClientProxy_test_for('bitcount', 'bitcount', ['test'])
  redisClientProxy_test_for('bitcount', 'bitcount', ['test', 1, 2])
  redisClientProxy_test_for('bitfield', 'bitfield', ['test', 1])
  redisClientProxy_test_for('bitfield', 'bitfield', ['test', [1]])
  redisClientProxy_test_for('bitfield', 'bitfield', ['test', ['test']])
  redisClientProxy_test_for('bitop', 'bitop', ['test', 'a', 'b', 'c', 'd'])
  redisClientProxy_test_for('bitpos', 'bitpos', ['test', 1, 0, 2])
  redisClientProxy_test_for('brpoplpush', 'brpoplpush', ['list', 'another-list', 10])

  redisClientProxy_test_for('command', 'command', [])

  redisClientProxy_test_for('dbsize', 'dbsize', [])
  redisClientProxy_test_for('decr', 'decr', ['test'])
  redisClientProxy_test_for('decrby', 'decrby', ['test', 1])
  redisClientProxy_test_for('discard', 'discard', [])
  redisClientProxy_test_for('dump', 'dump', ['test'])

  redisClientProxy_test_for('echo', 'echo', ['test'])
  redisClientProxy_test_for('expire', 'expire', ['test', 12])
  redisClientProxy_test_for('expireat', 'expireat', ['test', 1212121212])

  redisClientProxy_test_for('flushall', 'flushall', [])
  redisClientProxy_test_for('flushdb', 'flushdb', [])

  redisClientProxy_test_for('get', 'get', ['test'])
  redisClientProxy_test_for('getbit', 'getbit', ['test', 7])
  redisClientProxy_test_for('getrange', 'getrange', ['test', 0, 3])
  redisClientProxy_test_for('getset', 'getset', ['test', 'value'])

  redisClientProxy_test_for('hexists', 'hexists', ['test', 'value'])
  redisClientProxy_test_for('hget', 'hget', ['test', 'value'])
  redisClientProxy_test_for('hgetall', 'hgetall', ['test'])
  redisClientProxy_test_for('hincrby', 'hincrby', ['test', 'value', 3])
  redisClientProxy_test_for('hincrbyfloat', 'hincrbyfloat', ['test', 'value', 3.0])
  redisClientProxy_test_for('hkeys', 'hkeys', ['test'])
  redisClientProxy_test_for('hlen', 'hlen', ['test'])
  redisClientProxy_test_for('hset', 'hset', ['test', 'value', 'value'])
  redisClientProxy_test_for('hsetnx', 'hsetnx', ['test', 'value', 'value'])
  redisClientProxy_test_for('hstrlen', 'hstrlen', ['test', 'value'])
  redisClientProxy_test_for('hvals', 'hvals', ['test'])

  redisClientProxy_test_for('incr', 'incr', ['test'])
  redisClientProxy_test_for('incrby', 'incrby', ['test', 3])
  redisClientProxy_test_for('incrbyfloat', 'incrbyfloat', ['test', 3.0])

  redisClientProxy_test_for('keys', 'keys', ['test'])

  redisClientProxy_test_for('lastsave', 'lastsave', [])
  redisClientProxy_test_for('lindex', 'lindex', ['test', 1])
  redisClientProxy_test_for('linsert', 'linsert', ['test', 'AFTER', 'test', 'value'])
  redisClientProxy_test_for('llen', 'llen', ['test'])
  redisClientProxy_test_for('lpop', 'lpop', ['test'])
  redisClientProxy_test_for('lpushx', 'lpushx', ['lpushx', 'value'])
  redisClientProxy_test_for('lrange', 'lrange', ['test', 0, 1])
  redisClientProxy_test_for('lrem', 'lrem', ['test', 1, 'value'])
  redisClientProxy_test_for('lset', 'lset', ['test', 1, 'value'])
  redisClientProxy_test_for('ltrim', 'ltrim', ['test', 1, 2])

  redisClientProxy_test_for('move', 'move', ['test', 1])

  redisClientProxy_test_for('persist', 'persist', ['test'])
  redisClientProxy_test_for('pexpire', 'pexpire', ['test', 1])
  redisClientProxy_test_for('pexpireat', 'pexpireat', ['test', 1])
  redisClientProxy_test_for('psetex', 'psetex', ['test', 1, 'value'])
  redisClientProxy_test_for('pttl', 'pttl', ['test'])

  redisClientProxy_test_for('quit', 'quit', [])

  redisClientProxy_test_for('randomkey', 'randomkey', [])
  redisClientProxy_test_for('readonly', 'readonly', [])
  redisClientProxy_test_for('readwrite', 'readwrite', [])
  redisClientProxy_test_for('rename', 'rename', ['test', 'test-new'])
  redisClientProxy_test_for('renamenx', 'renamenx', ['test', 'test-new'])
  redisClientProxy_test_for('restore', 'restore', ['test', 1, 'value'])
  redisClientProxy_test_for('role', 'role', [])
  redisClientProxy_test_for('rpop', 'rpop', ['test'])
  redisClientProxy_test_for('rpoplpush', 'rpoplpush', ['test', 'value'])
  redisClientProxy_test_for('rpushx', 'rpushx', ['test', 'value'])

  redisClientProxy_test_for('save', 'save', [])
  redisClientProxy_test_for('scard', 'scard', ['test'])
  redisClientProxy_test_for('select', 'select', ['test'])
  redisClientProxy_test_for('select', 'select', [0])
  redisClientProxy_test_for('set', 'set', ['test', 'value'])
  redisClientProxy_test_for('set', 'set', ['test', 'value', 'any'])
  redisClientProxy_test_for('set', 'set', ['test', 'value', 'any', 12])
  redisClientProxy_test_for('set', 'set', ['test', 'value', 'any', 12, 'any'])
  redisClientProxy_test_for('setbit', 'setbit', ['test', 0, '1'])
  redisClientProxy_test_for('setex', 'setex', ['test', 12, 'value'])
  redisClientProxy_test_for('setnx', 'setnx', ['test', 'value'])
  redisClientProxy_test_for('setrange', 'setrange', ['test', 0, 'value'])
  redisClientProxy_test_for('sismember', 'sismember', ['test', 'member'])
  redisClientProxy_test_for('slaveof', 'slaveof', ['localhost', '6666'])
  redisClientProxy_test_for('smembers', 'smembers', ['test'])
  redisClientProxy_test_for('smove', 'smove', ['source', 'destination', 'test'])
  redisClientProxy_test_for('spop', 'spop', ['test'])
  redisClientProxy_test_for('spop', 'spop', ['test', 2])
  redisClientProxy_test_for('srandmember', 'srandmember', ['test'])
  redisClientProxy_test_for('srandmember', 'srandmember', ['test', 2])
  redisClientProxy_test_for('strlen', 'strlen', ['test'])
  redisClientProxy_test_for('sync', 'sync', [])

  redisClientProxy_test_for('time', 'time', [])
  redisClientProxy_test_for('ttl', 'ttl', ['test'])
  redisClientProxy_test_for('type', 'type', ['test'])

  redisClientProxy_test_for('unwatch', 'unwatch', [])
  redisClientProxy_test_for('wait', 'wait', [1, 10000])
})
