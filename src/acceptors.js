/*
eslint-disable no-underscore-dangle, import/no-unresolved, import/extensions
 */

import { ObjectId } from 'mongodb';
import { SUCCESS, INVALID_INTEGER,
  OBJECT_IS_NOT_FOUND, SERVER_FAILED, OBJECT_IS_UNDEFINED_OR_NULL } from 'nagu-validates';
import AcceptorManager from 'jkef-model';

export default class AcceptorMiddlewares {
  constructor(mongoUrl, acceptorCollection = 'acceptors') {
    this.mongoUrl = mongoUrl;
    this.collectionName = acceptorCollection;
    this.acceptorManager = new AcceptorManager(mongoUrl, acceptorCollection);
  }

  // 插入数据的中间件
  insert(
    // 定义如何获取待插入的数据，此数据必须包括"name, idCard: { type, number }"。默认取req.body
    getData = req => req.body,
    // 定义插入数据之后如何操作，默认为执行下一个中间件
    success = (data, req, res, next) => next(),
    // 定义插入数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),
  ) {
    return async (req, res, next) => {
      try {
        const acceptor = getData(req, res);
        // 姓名、证件信息均不能为空
        if (!acceptor
          || !acceptor.name
          || !acceptor.idCard
          || !acceptor.idCard.number
        ) {
          fail({ ret: OBJECT_IS_UNDEFINED_OR_NULL, msg: '姓名、证件信息均不能为空' }, req, res, next);
          return;
        }
        // 1. 保存数据到数据库中
        const insertedId = await this.acceptorManager.insert(acceptor);
        // 2 返回结果
        success({
          ...acceptor,
          _id: acceptor._id || insertedId,
        }, req, res, next);
      } catch (e) {
        fail({ ret: SERVER_FAILED, msg: e }, req, res, next);
      }
    };
  }

  // 根据IdCard.Number查找acceptor
  findOneByIdCardNumber(
    getIdCardNumber = () => {},
    success = (acceptor, req, res, next) => next(),
    fail = (err, req, res) => res.send(err),
  ) {
    return async (req, res, next) => {
      try {
        const number = getIdCardNumber(req, res);
        if (!number) {
          fail({ ret: OBJECT_IS_UNDEFINED_OR_NULL, msg: '必须指定idcard.number' }, req, res, next);
          return;
        }
        const doc = await this.acceptorManager.findOneByIdCardNumber(number);
        success(doc, req, res, next);
      } catch (e) {
        fail({ ret: SERVER_FAILED, msg: e }, req, res, next);
      }
    };
  }

  // 通过Id获取数据的中间件
  getById(
    // 定义如何获取数据的_id
    getId = () => null,
    // 定义获取数据之后如何操作，默认为返回成功代码及数据
    success = (data, req, res) => res.send({ ret: SUCCESS, data }),
    // 定义获取数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),
  ) {
    return async (req, res, next) => {
      try {
        const id = getId(req, res);
        if (!id) {
          fail({ ret: OBJECT_IS_UNDEFINED_OR_NULL, msg: '必须提供id' }, req, res, next);
          return;
        }
        const data = await this.acceptorManager.findById(id);
        if (!data) {
          fail({ ret: OBJECT_IS_NOT_FOUND, msg: '对象不存在' }, req, res, next);
          return;
        }
        success(data, req, res, next);
      } catch (e) {
        fail({
          ret: SERVER_FAILED,
          msg: e,
        }, req, res, next);
      }
    };
  }

  listByRecord(
    // 获取查询参数
    getParams = () => null,
    // 定义获取数据之后如何操作，默认为返回成功代码及数据
    success = (data, req, res, next) => next(),
    // 定义获取数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),
  ) {
    return async (req, res, next) => {
      try {
        const params = getParams(req, res);
        if (!params) {
          fail({ ret: OBJECT_IS_UNDEFINED_OR_NULL, msg: '查询参数必须指定' }, req, res, next);
          return;
        }
        let { pageIndex, pageSize } = params;
        if (pageIndex) {
          if (!Number.isInteger(pageIndex) || pageIndex < 0) {
            fail({ ret: INVALID_INTEGER, msg: 'pageIndex必须是0以上的整数' }, req, res, next);
            return;
          }
        } else pageIndex = 0;
        if (pageSize) {
          if (!Number.isInteger(pageSize) || pageSize < 0) {
            fail({ ret: INVALID_INTEGER, msg: 'pageSize必须是0以上的整数' }, req, res, next);
            return;
          }
        } else pageSize = 100;
        const limit = pageSize;
        const skip = pageSize * pageIndex;
        const data = await this.acceptorManager.listByRecord({
          ...params,
          limit,
          skip,
        });
        success(data, req, res, next);
      } catch (msg) {
        fail({ ret: SERVER_FAILED, msg }, req, res, next);
      }
    };
  }

  updateById(
    getId = () => null,
    getNewData = () => null,
    // 定义获取数据之后如何操作，默认为返回成功代码及数据
    success = (data, req, res, next) => next(),
    // 定义获取数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),
  ) {
    return async (req, res, next) => {
      try {
        const _id = getId(req, res);
        if (!_id) {
          fail({ ret: OBJECT_IS_UNDEFINED_OR_NULL, msg: 'id不能为空' }, req, res, next);
          return;
        }
        const newData = getNewData(req, res);
        if (!newData) {
          fail({ ret: OBJECT_IS_UNDEFINED_OR_NULL, msg: '新数据不能为空' }, req, res, next);
          return;
        }
        const result = await this.acceptorManager.updateById({ ...newData, _id });
        success(result, req, res, next);
      } catch (msg) {
        fail({ ret: SERVER_FAILED, msg }, req, res, next);
      }
    };
  }

  // 添加教育经历
  addEdu(
    // 定义如何获取数据的_id
    getId = () => null,
    // 获取教育经历信息
    getEdu = req => req.body,
    // 定义获取数据之后如何操作，默认为返回成功代码及数据
    success = (data, req, res, next) => next(),
    // 定义获取数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),
  ) {
    return async (req, res, next) => {
      try {
        const id = getId(req, res);
        if (!id) {
          fail({ ret: OBJECT_IS_UNDEFINED_OR_NULL, msg: 'id不能为空' }, req, res, next);
          return;
        }
        const edu = getEdu(req, res);
        if (!edu
          || !edu.name
          || !edu.degree
          || !edu.year
          || !Number.isInteger(edu.year)
        ) {
          fail({
            ret: OBJECT_IS_UNDEFINED_OR_NULL,
            msg: '必须提供学校名称、层次和入学年份，入学年份必须是数字',
          }, req, res, next);
          return;
        }
        const result = await this.acceptorManager.addEdu(id, edu);
        success(result, req, res, next);
      } catch (msg) {
        fail({ ret: SERVER_FAILED, msg }, req, res, next);
      }
    };
  }

  // 添加教育经历
  removeEdu(
    // 定义如何获取数据的_id
    getId = () => null,
    // 获取教育经历信息
    getEdu = req => req.body,
    // 定义获取数据之后如何操作，默认为返回成功代码及数据
    success = (data, req, res, next) => next(),
    // 定义获取数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),
  ) {
    return async (req, res, next) => {
      try {
        const id = getId(req, res);
        if (!id) {
          fail({ ret: OBJECT_IS_UNDEFINED_OR_NULL, msg: 'id不能为空' }, req, res, next);
          return;
        }
        const edu = getEdu(req, res);
        if (!edu
         || !edu.name
         || !edu.year
         || !Number.isInteger(edu.year)
       ) {
          fail({
            ret: OBJECT_IS_UNDEFINED_OR_NULL,
            msg: '必须提供学校名称和入学年份，入学年份必须是数字',
          }, req, res, next);
          return;
        }
        const result = await this.acceptorManager.removeEdu(id, edu);
        success(result, req, res, next);
      } catch (msg) {
        fail({ ret: SERVER_FAILED, msg }, req, res, next);
      }
    };
  }

  // 添加工作经历
  addCareer(
    // 定义如何获取数据的_id
    getId = () => null,
    // 获取工作经历信息
    getCareer = req => req.body,
    // 定义获取数据之后如何操作，默认为返回成功代码及数据
    success = (data, req, res, next) => next(),
    // 定义获取数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),
  ) {
    return async (req, res, next) => {
      try {
        const id = getId(req, res);
        if (!id) {
          fail({ ret: OBJECT_IS_UNDEFINED_OR_NULL, msg: 'id不能为空' }, req, res, next);
          return;
        }
        const career = getCareer(req, res);
        if (!career
         || !career.name
         || !career.year
         || !Number.isInteger(career.year)
        ) {
          fail({
            ret: OBJECT_IS_UNDEFINED_OR_NULL,
            msg: '必须提供公司名称和入职年份，入职年份必须是数字',
          }, req, res, next);
          return;
        }
        const result = await this.acceptorManager.addCareer(id, career);
        success(result, req, res, next);
      } catch (msg) {
        fail({ ret: SERVER_FAILED, msg }, req, res, next);
      }
    };
  }

  // 删除工作经历
  removeCareer(
    // 定义如何获取数据的_id
    getId = () => null,
    // 获取教育经历信息
    getCareer = req => req.body,
    // 定义获取数据之后如何操作，默认为返回成功代码及数据
    success = (data, req, res, next) => next(),
    // 定义获取数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),
  ) {
    return async (req, res, next) => {
      try {
        const id = getId(req, res);
        if (!id) {
          fail({ ret: OBJECT_IS_UNDEFINED_OR_NULL, msg: 'id不能为空' }, req, res, next);
          return;
        }
        const career = getCareer(req, res);
        if (!career
         || !career.name
         || !career.year
         || !Number.isInteger(career.year)
       ) {
          fail({
            ret: OBJECT_IS_UNDEFINED_OR_NULL,
            msg: '必须提供学校名称和入学年份，入学年份必须是数字',
          }, req, res, next);
          return;
        }
        const result = await this.acceptorManager.removeCareer(id, career);
        success(result, req, res, next);
      } catch (msg) {
        fail({ ret: SERVER_FAILED, msg }, req, res, next);
      }
    };
  }

  // 添加奖助记录
  addRecord(
    // 定义如何获取数据的_id
    getId = () => null,
    // 获取奖助信息
    getRecord = req => req.body,
    // 定义获取数据之后如何操作，默认为返回成功代码及数据
    success = (data, req, res, next) => next(),
    // 定义获取数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),
  ) {
    return async (req, res, next) => {
      try {
        const id = getId(req, res);
        if (!id) {
          fail({ ret: OBJECT_IS_UNDEFINED_OR_NULL, msg: 'id不能为空' }, req, res, next);
          return;
        }
        const record = getRecord(req, res);
        if (!record
         || !record.project
         || !record.amount
         || !Number.isInteger(record.amount * 1000)
         || !record.date
         || !(record.date instanceof Date)
        ) {
          fail({
            ret: OBJECT_IS_UNDEFINED_OR_NULL,
            msg: '必须提供项目名称和金额，金额必须是数字，日期必须是Date类型',
          }, req, res, next);
          return;
        }
        const recordId = await this.acceptorManager.addRecord(id, {
          ...record,
          amount: record.amount * 1000,
          _id: new ObjectId(),
        });
        success(recordId, req, res, next);
      } catch (msg) {
        fail({ ret: SERVER_FAILED, msg }, req, res, next);
      }
    };
  }

  removeRecord(
    // 定义如何获取数据的_id
    getId = () => null,
    // 获取奖助记录Id
    getRecordId = () => null,
    // 定义获取数据之后如何操作，默认为返回成功代码及数据
    success = (data, req, res, next) => next(),
    // 定义获取数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),
  ) {
    return async (req, res, next) => {
      try {
        const id = getId(req, res);
        if (!id) {
          fail({ ret: OBJECT_IS_UNDEFINED_OR_NULL, msg: 'id不能为空' }, req, res, next);
          return;
        }
        const recordId = getRecordId(req, res);
        if (!recordId) {
          fail({ ret: OBJECT_IS_UNDEFINED_OR_NULL, msg: 'recordId不能为空' }, req, res, next);
          return;
        }
        const result = await this.acceptorManager.removeRecord(id, recordId);
        success(result, req, res, next);
      } catch (msg) {
        fail({ ret: SERVER_FAILED, msg }, req, res, next);
      }
    };
  }

  removeById(
    // 定义如何获取数据的_id
    getId = () => null,
    // 定义获取数据之后如何操作，默认为返回成功代码及数据
    success = (data, req, res) => res.send({ ret: SUCCESS, data }),
    // 定义获取数据失败时如何操作，默认为返回失败代码及描述
    fail = (e, req, res) => res.send(e),
  ) {
    return async (req, res, next) => {
      try {
        const id = getId(req, res);
        if (!id) {
          fail({ ret: OBJECT_IS_UNDEFINED_OR_NULL, msg: '必须提供id' }, req, res, next);
          return;
        }
        const result = await this.acceptorManager.removeById(id);
        success(result, req, res, next);
      } catch (e) {
        fail({
          ret: SERVER_FAILED,
          msg: e,
        }, req, res, next);
      }
    };
  }
}
