export async function addon(command, msg) {
    const command1 = {
        action: "test",
        url: "https://event.yomiuri.co.jp/jssa/form/tokyo",
        cookies: [],
        body: {},
        method: "GET",
        header: {},
    }
    const res = await this.req(command1,msg)

    var root = HTMLParser.parse(res.body);

    var xsrf_token = root.querySelectorAll('input[name="_token"]')[0]?.attributes.value

    var body = command.body

    body["_token"]=xsrf_token

    const command2 = {
        action: "test",
        url: "https://event.yomiuri.co.jp/jssa/form/tokyo/confirm",
        cookies: [],
        body: body,
        method: "POST",
        body_encode: "multipart",
        header: {}
    }

    const res2 = await this.req(command2,msg)

    var root2 = HTMLParser.parse(res2.body);

    var token = root2.querySelectorAll('input[name="_token"]')[0]?.attributes.value

    const command3 = {
        action: "test",
        url: "https://event.yomiuri.co.jp/jssa/form/tokyo",
        cookies: [],
        body: {
            "_token":token
        },
        method: "POST",
        body_encode: "multipart",
        header: {}
    }

    const res3 = await this.req(command3,msg)




}
