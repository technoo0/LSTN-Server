import { db } from "./db";



const GanrateCode = () => {
    let code = Math.floor(10000 + Math.random() * 90000);
    return code.toString();
}


const CreateCode = async (email: string) => {
    const code = GanrateCode()
    try {
        const exitingCode = await db.code.deleteMany({ where: { email } })

        const codeRec = await db.code.create({
            data: {
                email,
                code,
            }
        })
        return code
    } catch (e) {
        console.log(e)
    }


}

const CheckCode = async (email: string, code: string) => {
    try {
        const rec = await db.code.findFirst({
            where: {
                email,
                code
            }
        })
        return (rec)
    } catch (e) {
        console.log(e)
        return null
    }
}

const DeleteCodes = async () => {
    const threshold = new Date(Date.now() - 10 * 60 * 1000);
    const oldCode = await db.code.deleteMany({
        where: {
            createdAt: {
                lte: threshold,
            },
        },
    })
    console.log("deleted old codes", oldCode.count)

}

setInterval(DeleteCodes, 1000 * 60)



export {

    GanrateCode,
    CreateCode,
    CheckCode
}