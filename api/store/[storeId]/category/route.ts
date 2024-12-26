import { NextRequest, NextResponse } from 'next/server'

type Params = {
    storeId: string
}

export const POST = async (request: NextRequest, { params }: { params: Params }) => {
    try {
        const { userId } = await auth()
        const body = await request.json()
        if (!userId) {
            const responseJson = createResponse(false, null, 'User not logged in!!')
            return NextResponse.json(responseJson)
        }
        const existUser = await db.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!existUser) {
            const responseJson = createResponse(false, null, 'User does not exist!!')
            return NextResponse.json(responseJson)
        }

        const hasStoreLoggedInUser = await db.store.findUnique({
            where: {
                id: params.storeId,
                ownerId: existUser.id
            }
        })
        if (!hasStoreLoggedInUser) {
            const responseJson = createResponse(false, null, 'User does not have store!!')
            return NextResponse.json(responseJson)
        }

        const validation = categorySchema.safeParse(body)

        if (!validation.success) {
            const responseJson = createResponse(false, null, 'Invalid Fields!!')
            return NextResponse.json(responseJson)
        }

        const { storeId, name } = validation.data

        const existCategory = await db.category.findUnique({
            where: {
                storeId,
                name
            }
        })

        if (existCategory) {
            const message = `Store '${hasStoreLoggedInUser.storeName}' already has ${existCategory.name} category `
            const responseJson = createResponse(false, null, message)
            return NextResponse.json(responseJson)
        }

        const newCategory = await db.category.create({
            data: {
                name,
                storeId
            }
        })

        const responseJson = createResponse(true, newCategory, `Category created!!`)
        return NextResponse.json(responseJson)
        
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            success: false,
            message: 'Something Went Wrong Inside Create Category',
            error
        })
    }
}



export const GET = async (request: NextRequest, { params }: { params: Params }) => {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'User not logged in!!',
                data: null
            })
        }
        const existUser = await db.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!existUser) {
            return NextResponse.json({
                success: false,
                message: 'User does not exist!!',
                data: null
            })
        }

        const hasStoreLoggedInUser = await db.store.findUnique({
            where: {
                id: params.storeId,
                ownerId: existUser.id
            }
        })

        if (!hasStoreLoggedInUser) {
            return NextResponse.json({
                success: false,
                message: 'User does not have store!!',
                data: null
            })
        }

        const categories = await db.category.findMany({
            where: {
                storeId: params.storeId
            }
        })
        return NextResponse.json({
            success: true,
            message: `Categories retrieved!!`,
            data: categories
        })

    } catch (error) {
        console.log(error)
        return NextResponse.json({
            success: false,
            message: 'Something Went Wrong Inside GEt Categories',
            error
        })
    }
}