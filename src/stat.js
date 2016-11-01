import AcceptorManager from 'jkef-model';
import { SERVER_FAILED } from 'nagu-validates';

export default class StatMiddlewares {
  constructor(mongoUrl, acceptorCollection = 'acceptors') {
    this.mongoUrl = mongoUrl;
    this.collectionName = acceptorCollection;
    this.acceptorManager = new AcceptorManager(mongoUrl, acceptorCollection);
  }

  getStatByProject(
    // 定义获取数据之后如何操作，默认为返回成功代码及数据
    success = (data, req, res, next) => next(),
    // 定义获取数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),
  ) {
    return async (req, res, next) => {
      try {
        const data = await this.acceptorManager.getStatByProject();
        success(data, req, res, next);
      } catch (msg) {
        fail({ ret: SERVER_FAILED, msg }, req, res, next);
      }
    };
  }

  getStatByYear(
    // 定义获取数据之后如何操作，默认为返回成功代码及数据
    success = (data, req, res, next) => next(),
    // 定义获取数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),
  ) {
    return async (req, res, next) => {
      try {
        const data = await this.acceptorManager.getStatByYear();
        success(data, req, res, next);
      } catch (msg) {
        fail({ ret: SERVER_FAILED, msg }, req, res, next);
      }
    };
  }
}
