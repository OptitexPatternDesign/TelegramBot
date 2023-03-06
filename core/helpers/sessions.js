const m = exports
//
const tokens = require("../helpers/tokens");
const users  = require("../helpers/users");

/*
 * Update session and return properties
 */
m.update = async function (ctx, key=null) {
  switch (key) {
    case 'token': if (ctx.session.activeToken)
      return ctx.session.activeToken = await tokens.get(ctx.session.activeToken.key)
      break
    case 'user': if (ctx.session.activeUser)
      return ctx.session.activeUser = await users.get(ctx.session.activeUser.key)
      break
  }
}