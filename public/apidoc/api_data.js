define({ "api": [
  {
    "type": "post",
    "url": "/login",
    "title": "用户登录",
    "description": "<p>用户登录</p>",
    "name": "login",
    "group": "user",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "username",
            "description": "<p>用户名</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "password",
            "description": "<p>密码</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n   \"success\": true,\n   \"msg\": \"\",\n   \"data\": {}\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "http://192.168.1.5:3000/login"
      }
    ],
    "version": "1.0.0",
    "filename": "routes/index.js",
    "groupTitle": "user"
  },
  {
    "type": "post",
    "url": "/register",
    "title": "用户注册",
    "description": "<p>用户注册</p>",
    "name": "register",
    "group": "user",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "username",
            "description": "<p>用户名</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "password",
            "description": "<p>密码</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n   \"success\": true,\n   \"msg\": \"\",\n   \"data\": {}\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "http://192.168.1.5:3000/register"
      }
    ],
    "version": "1.0.0",
    "filename": "routes/index.js",
    "groupTitle": "user"
  },
  {
    "type": "post",
    "url": "/users/update/headimg",
    "title": "修改用户图片",
    "description": "<p>修改用户图片</p>",
    "name": "updateheadimg",
    "group": "user",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "authorization",
            "description": "<p>用户token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "boolean",
            "optional": false,
            "field": "success",
            "description": "<p>成功：true，失败：false</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "msg",
            "description": "<p>提示信息</p>"
          },
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>返回结果</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n   \"success\": true,\n   \"msg\": \"\",\n   \"data\": {}\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "http://192.168.1.5:3000/users/update/headimg"
      }
    ],
    "version": "1.0.0",
    "filename": "routes/users.js",
    "groupTitle": "user"
  },
  {
    "type": "get",
    "url": "/users/userinfo",
    "title": "查询用户信息",
    "description": "<p>查询用户信息</p>",
    "name": "userinfo",
    "group": "user",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "authorization",
            "description": "<p>用户token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "boolean",
            "optional": false,
            "field": "success",
            "description": "<p>成功：true，失败：false</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "msg",
            "description": "<p>提示信息</p>"
          },
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>返回结果</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n   \"success\": true,\n   \"msg\": \"\",\n   \"data\": {}\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "http://192.168.1.5:3000/users/userinfo"
      }
    ],
    "version": "1.0.0",
    "filename": "routes/users.js",
    "groupTitle": "user"
  },
  {
    "type": "get",
    "url": "/users",
    "title": "查询所有用户",
    "description": "<p>查询所有用户</p>",
    "name": "users",
    "group": "user",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "authorization",
            "description": "<p>用户token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "page",
            "description": "<p>当前页</p>"
          },
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "pageNum",
            "description": "<p>一页的条数</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "boolean",
            "optional": false,
            "field": "success",
            "description": "<p>成功：true，失败：false</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "msg",
            "description": "<p>提示信息</p>"
          },
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>返回结果</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n   \"success\": true,\n   \"msg\": \"\",\n   \"data\": {}\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "http://192.168.1.5:3000/users"
      }
    ],
    "version": "1.0.0",
    "filename": "routes/users.js",
    "groupTitle": "user"
  },
  {
    "type": "post",
    "url": "/wxlogin",
    "title": "微信登录",
    "description": "<p>微信登录</p>",
    "name": "wxlogin",
    "group": "user",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "js_code",
            "description": "<p>微信code</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n   \"success\": true,\n   \"msg\": \"\",\n   \"data\": {}\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "http://192.168.1.5:3000/wxlogin"
      }
    ],
    "version": "1.0.0",
    "filename": "routes/index.js",
    "groupTitle": "user"
  }
] });
