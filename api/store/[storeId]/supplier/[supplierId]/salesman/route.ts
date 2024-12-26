import { NextRequest, NextResponse } from 'next/server'
type Params = {
    storeId: string;
    supplierId: string;
}

export const POST = async (request: NextResponse, { params }: { params: Params }) => {
    try {
        const { userId } = await auth()
        const { storeId, supplierId } = params
        const body = await request.json()

        const validation = salesManSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: 'Invalid Field',
                error: validation.error.issues
            })
        }

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'Please log in',
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
                message: 'Unauthorized access!',
                data: null
            })
        }

        if (!storeId || !supplierId) {
            return NextResponse.json({
                success: false,
                message: 'Store id or Supplier id is missing',
                data: null
            })
        }

        const hasUserStore = await db.store.findUnique({
            where: {
                id: storeId,
                ownerId: existUser.id
            }
        })

        if (!hasUserStore) {
            return NextResponse.json({
                success: false,
                message: `Store doesn't belongs to logged in user`,
                data: null
            })
        }

        const hasStoreSupplier = await db.supplier.findUnique({
            where: {
                id: supplierId,
                storeId,
            }
        })

        if (!hasStoreSupplier) {
            return NextResponse.json({
                success: false,
                message: `Supplier doesn't belongs to current store`,
                data: null
            })
        }

        const existSalesMan = await db.salesMan.findUnique({
            where: {
                storeId,
                supplierId,
                OR: [
                    { NID },
                    { mobile }
                ]
            }
        })

        if (existSalesMan) {
            return NextResponse.json({
                success: false,
                message: `Sales Man '${existSalesMan.name}' already work under '${hasStoreSupplier.name}' Supplier`,
                data: null
            })
        }

        const newSalesMan = await db.salesMan.create({
            data: {
                name,
                NID,
                mobile,
                storeId,
                supplierId
            }
        })
        return NextResponse.json({
            success: true,
            message: `Sales Man created!!!`,
            data: newSalesMan
        })

    } catch (error) {
        console.log(error)
        return NextResponse.json({
            success: false,
            message: `Something went wrong create salesman`,
            error
        })
    }
}


export const GET = async (request: NextRequest, { params }: { params: Params }) => {
    try {
        const { userId } = await auth()
    const { storeId, supplierId } = params

    if (!userId) {
        return NextResponse.json({
            success: false,
            message: 'Please log in',
            data: null
        })
    }

    if (!storeId || !supplierId) {
        return NextResponse.json({
            success: false,
            message: 'Store id or Supplier id is missing',
            data: null
        })
    }

    const salesMans = await db.salesMan.findMany({
        where: {
            ownerId: userId,
            storeId,
            supplierId
        }
    })
    return NextResponse.json({
        success: true,
        message: 'Sales Mans retrieved!!!',
        data: salesMans
    })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            success: false,
            message: `Something went wrong get salesmans`,
            error
        })
    }
    }
}