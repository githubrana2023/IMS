import { NextRequest, NextResponse } from 'next/server'

type Params = {
    storeId: string
}

export const POST = async (request: NextRequest, { params }: { params: Params }) => {
    try {
        const { userId } = await auth()
        const body = await request.json()
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

        const validation = categorySchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: 'Invalid Fields!!',
                data: null
            })
        }

        const { storeId, name } = validation.data

        const existCategory = await db.category.findUnique({
            where: {
                storeId,
                name
            }
        })

        if (existCategory) {
            return NextResponse.json({
                success: false,
                message: `Store '${hasStoreLoggedInUser.storeName}' already has ${existCategory.name} category `,
                data: null
            })
        }

        const newCategory = await db.category.create({
            data: {
                name,
                storeId
            }
        })

        return NextResponse.json({
            success: false,
            message: `Category created!!`,
            data: newCategory
        })
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