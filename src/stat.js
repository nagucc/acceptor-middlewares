/*
eslint-disable import/extensions, import/no-unresolved, no-param-reassign
 */
import AcceptorManager from 'jkef-model';
import { SERVER_FAILED } from 'nagu-validates';
import cacheProxy from './memory-cache-proxy';

export default class StatMiddlewares {
  constructor(mongoUrl, acceptorCollection = 'acceptors') {
    this.mongoUrl = mongoUrl;
    this.collectionName = acceptorCollection;
    this.acceptorManager = new AcceptorManager(mongoUrl, acceptorCollection);
  }

  getStatByProject(
    // 定义获取数据之后如何操作，默认为返回成功代码及数据
    success = (data, req, res, next) => {
      res.stateByProject = data;
      next();
    },

    // 定义获取数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),

    // 缓存选项，默认缓存10个小时
    cacheOptions = {
      key: 'jkef:acceptors:stat:byproject',
      expire: 10 * 3600 * 1000,
    }
  ) {
    return async (req, res, next) => {
      try {
        const data = await cacheProxy(
          this.acceptorManager.getStatByProject.bind(this.acceptorManager),
          cacheOptions
        );
        success(data, req, res, next);
      } catch (msg) {
        fail({ ret: SERVER_FAILED, msg }, req, res, next);
      }
    };
  }

  getStatByYear(
    // 定义获取数据之后如何操作，默认为返回成功代码及数据
    success = (data, req, res, next) => {
      res.stateByYear = data;
      next();
    },

    // 定义获取数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),

    // 缓存选项，默认缓存10个小时
    cacheOptions = {
      key: 'jkef:acceptors:stat:byyear',
      expire: 10 * 3600 * 1000,
    }
  ) {
    return async (req, res, next) => {
      try {
        // const data = await this.acceptorManager.getStatByYear();
        const data = await cacheProxy(
          this.acceptorManager.getStatByYear.bind(this.acceptorManager),
          cacheOptions
        );
        success(data, req, res, next);
      } catch (msg) {
        fail({ ret: SERVER_FAILED, msg }, req, res, next);
      }
    };
  }
}
