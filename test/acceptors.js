/* eslint-env mocha */
/*
  eslint-disable padded-blocks, no-unused-expressions, no-underscore-dangle
 */

import 'babel-polyfill';
import { expect } from 'chai';
import { createRequest, createResponse } from 'node-mocks-http';
import { OBJECT_IS_UNDEFINED_OR_NULL,
  OBJECT_IS_NOT_FOUND, INVALID_INTEGER } from 'nagu-validates';
import AcceptorMiddlewares from '../src';

const mongoUrl = 'mongodb://localhost/test';
const middlewares = new AcceptorMiddlewares(mongoUrl);

const sendResult = (result, req, res) => res.send(result);

const testUser = Math.random().toString();
const rawAcceptor = {
  name: 'tst',
  isMale: true,
  phone: '14356785443',
  userid: testUser,
  idCard: { type: 'test', number: Math.random() },
};
describe('Acceptor Middlewares', () => {
  describe('insert()', () => {
    // 资料不全不能插入数据，返回错误代码
    // name 和 idCard.number是必须字段。
    [
      null,
      {}, // 空数据
      { name: 'name' }, // 没有idCard
      { idCard: { type: 'test', number: 'number' } }, // 没有name
      { name: 'name', idCard: { type: 'type' } }, // 没有number
    ].map(acceptor => it('资料不全不能插入数据，返回错误代码', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.insert(
        () => acceptor,
        sendResult,
      )(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    }));

    it('正确添加', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.insert(
        () => rawAcceptor,
        sendResult,
      )(req, res);
      const result = res._getData();
      expect(result._id).to.be.ok;
      rawAcceptor._id = result._id;
    });
  });

  describe('findOneByIdCardNumber()', () => {
    it('错误处理', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.findOneByIdCardNumber(
        () => null,
      )(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    });

    it('正确获取', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.findOneByIdCardNumber(
        () => rawAcceptor.idCard.number,
        sendResult,
      )(req, res);
      const result = res._getData();
      expect(result).to.eql(rawAcceptor);
    });
  });

  describe('getById()', () => {
    it('Id错误时', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.getById()(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    });

    it('未找到对象时', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.getById(
        () => Math.random(),
      )(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_NOT_FOUND);
    });

    it('正确获取', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.getById(
        () => rawAcceptor._id,
        sendResult,
      )(req, res);
      const result = res._getData();
      expect(result).to.eql(rawAcceptor);
    });
  });

  describe('updateById()', () => {
    it('错误处理：Id为null', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.updateById()(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    });

    it('错误处理：新数据为Null', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.updateById(
        () => rawAcceptor._id,
      )(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    });

    it('正确更新', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.updateById(
        () => rawAcceptor._id,
        () => ({ ...rawAcceptor, phone: 'update' }),
        sendResult,
      )(req, res);
      const result = res._getData();
      expect(result.result.ok).to.eql(1);
    });
  });

  const edu = {
    name: 'edu',
    degree: 'degree',
    year: 1988,
  };
  describe('addEdu()', () => {
    it('Id错误时', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.addEdu()(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    });

    // 教育经历数据错误
    [
      null,
      {},
      { name: 'edu' },
      { name: 'edu', degree: 'degree' },
      { name: 'edu', degree: 'degree', year: '1988' },
    ].map(item => it(`错误的教育经历数据：${item}`, async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.addEdu(
        () => rawAcceptor._id,
        () => item,
      )(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    }));
    it('正确添加', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.addEdu(
        () => rawAcceptor._id,
        () => edu,
        sendResult
      )(req, res);
      const result = res._getData();
      expect(result.result.ok).to.eql(1);
    });
  });
  describe('removeEdu()', () => {
    it('Id错误时', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.removeEdu()(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    });

    // 教育经历数据错误
    [
      null,
      {},
      { name: 'edu' },
      { name: 'edu', year: '1988' },
    ].map(item => it(`错误的教育经历数据：${item}`, async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.removeEdu(
        () => rawAcceptor._id,
        () => item,
      )(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    }));
    it('正确删除', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.removeEdu(
        () => rawAcceptor._id,
        () => edu,
        sendResult,
      )(req, res);
    });
  });

  const career = {
    name: 'career',
    year: 1989,
  };
  describe('addCareer()', () => {
    it('Id错误时', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.addCareer()(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    });

    // 工作经历数据错误
    [
      null,
      {},
      { name: 'edu' },
      { name: 'edu', year: '1988' },
    ].map(item => it(`错误的工作经历数据：${item}`, async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.addCareer(
        () => rawAcceptor._id,
        () => item,
      )(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    }));
    it('正确添加', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.addCareer(
        () => rawAcceptor._id,
        () => career,
        sendResult
      )(req, res);
      const result = res._getData();
      expect(result.result.ok).to.eql(1);
    });
  });

  describe('removeCareer()', () => {
    it('Id错误时', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.removeCareer()(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    });

    // 工作经历数据错误
    [
      null,
      {},
      { name: 'edu' },
      { name: 'edu', year: '1988' },
    ].map(item => it(`错误的教育经历数据：${item}`, async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.removeCareer(
        () => rawAcceptor._id,
        () => item,
      )(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    }));
    it('正确删除', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.removeCareer(
        () => rawAcceptor._id,
        () => career,
        sendResult,
      )(req, res);
    });
  });

  const record = {
    project: 'test',
    amount: 32400,
    date: new Date(),
  };
  describe('addRecord()', () => {
    it('Id错误时', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.addRecord()(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    });

    // 奖助记录数据错误
    [
      null,
      {},
      { project: 'pro' },
      { project: 'pro', amount: 'feds' },
      { project: 'pro', amount: 34300 },
      { project: 'pro', amount: 34300, date: 'wrong date' },
    ].map(item => it(`错误的工作经历数据：${item}`, async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.addRecord(
        () => rawAcceptor._id,
        () => item,
      )(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    }));
    it('正确添加', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.addRecord(
        () => rawAcceptor._id,
        () => record,
        sendResult
      )(req, res);
      const result = res._getData();
      expect(result).to.be.ok;
      record._id = result;
    });
  });

  describe('listByRecord()', () => {
    // 查询参数错误
    [
      {
        params: null,
        ret: OBJECT_IS_UNDEFINED_OR_NULL,
      }, {
        params: { pageIndex: 23.44 },
        ret: INVALID_INTEGER,
      }, {
        params: { pageSize: -1 },
        ret: INVALID_INTEGER,
      },
    ].map(item => it(`查询参数错误：${item.params}，应返回${item.ret}`, async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.listByRecord(
        () => item.params,
      )(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(item.ret);
    }));

    // 查询参数正确
    [
      {},
      { pageIndex: 3 },
      { pageIndex: 3, pageSize: 30 },
      { pageIndex: 3, pageSize: 30, text: 'tes' },
      { pageIndex: 3, pageSize: 30, text: 'tes', year: 1989 },
      { pageIndex: 3, pageSize: 30, text: 'tes', year: 1989, project: 'res' },
      { pageIndex: 3, pageSize: 30, text: 'tes', year: 1989, project: 'res', other: 'dd' },
    ].map(item => it(`查询参数：${item}`, async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.listByRecord(
        () => item,
        sendResult,
      )(req, res);
      const result = res._getData();
      expect(result.totalCount).to.above(-1);
    }));
  });

  describe('removeRecord()', () => {
    it('Id错误时', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.removeRecord()(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    });

    it('recordId错误', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.removeRecord(
        () => rawAcceptor._id,
      )(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    });
    it('正确删除', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.removeCareer(
        () => rawAcceptor._id,
        () => record._id,
        sendResult,
      )(req, res);
    });
  });

  describe('removeById()', () => {
    it('Id错误时', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.removeById()(req, res);
      const result = res._getData();
      expect(result.ret).to.eql(OBJECT_IS_UNDEFINED_OR_NULL);
    });

    it('正确删除', async () => {
      const req = createRequest();
      const res = createResponse();
      await middlewares.removeById(
        () => rawAcceptor._id,
        sendResult,
      )(req, res);
    });
  });
});
