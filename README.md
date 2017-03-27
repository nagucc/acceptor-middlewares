# acceptor-middlewares
Express middlewares for acceptors

## Example

## API Reference

### Class AcceptorMiddlewares

#### constructor(mongoUrl, acceptorCollection = 'acceptors')
构造函数

- 参数
  - mongoUrl MongoDB数据的连接字符串，必须。
  - acceptorCollection acceptors集合的名称，默认为`acceptors`；

#### insert(getDate, success, fail): Middleware
返回用于插入Acceptor的中间件。

### Class StatMiddlewares

#### constructor(mongoUrl, acceptorCollection = 'acceptors')
构造函数

- 参数
  - mongoUrl MongoDB数据的连接字符串，必须。
  - acceptorCollection acceptors集合的名称，默认为`acceptors`；

#### getStatByProject(success, fail, cacheOptions)
按项目分类统计数据

- 参数
  - `success` 执行成功时的回调函数，默认将获取的数据返回到`res.stateByProject`中，并执行下一个中间件；
  - `fail` 执行失败时的回调函数，默认向客户端发送错误信息；
  - `cacheOptions` 缓存参数
    - `key` 缓存Key，必须。默认为`jkef:acceptors:stat:byproject`;
    - `expire` 缓存时间，必须，默认为`10小时`;

#### getStatByYear(success, fail, cacheOptions)
按年份分类统计数据

- 参数
  - `success` 执行成功时的回调函数，默认将获取的数据返回到`res.stateByYear`中，并执行下一个中间件；
  - `fail` 执行失败时的回调函数，默认向客户端发送错误信息；
  - `cacheOptions` 缓存参数
    - `key` 缓存Key，必须。默认为`jkef:acceptors:stat:byyear`;
    - `expire` 缓存时间，必须，默认为`10小时`;


## CHANGELOG

### v0.3.0

- 为StatMiddlewares增加缓存选项，默认缓存10个小时;
