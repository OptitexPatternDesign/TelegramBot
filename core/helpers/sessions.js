const m = exports
//
const tokens = require("../helpers/tokens");
const users  = require("../helpers/users");

/*
 * Update session and return properties
 */
m.get = async function (ctx, key=null) {
  switch (key) {
    case 'token': if (ctx.session.activeToken)
      return await tokens.get(ctx.session.activeToken)
      break
    case 'user': if (ctx.session.activeUser)
      return await users.get(ctx.session.activeUser)
      break
    case 'file': if (ctx.session.activeFile)
      return await users.get(ctx.session.activeFile)
      break
  }
}