const sellerModel = require('../models/sellers')
const userModel = require('../models/users')
const productModel = require('../models/Products')
const { ObjectId } = require('mongodb');

module.exports.addProduct = async (reqBody) => {
        let result = await productModel.create(reqBody)
        return result  
}

module.exports.updateProductDetails = async (reqBody) => { 
    let result = await productModel.findByIdAndUpdate({ _id: reqBody.productId }, { $set: reqBody })
    return result
}



module.exports.productListing = async (reqBody) => { 
    const page = reqBody.page_no * 1 || 1;
    const limit = reqBody.no_record * 1 || 10;
    const skip = (page - 1) * limit;
    const categoryId = reqBody.productCategoryID
    const searchText = reqBody.searchText
    let reqObj
    let searchObj;

  
    if (categoryId == '' && searchText == '') {
        reqObj = {
            $match: {}
        }
        searchObj = {
            $match: {}
        }
    }
    else if (categoryId) {
        reqObj = {
            $match: {
                productCategoryID: ObjectId(categoryId)
            }
        }
        searchObj = {
            $match: {}
        }
    }
    else if (searchText) {
        reqObj = {
            $match: {}
        }
        searchObj = {
            $match: {
                $or: [{
                    productTitle: {
                        $regex: searchText,
                        $options: "$ig"
                    },
                },
                {
                    productCategoryName: {
                        $regex: searchText,
                        $options: "$ig"
                    }
                }]
            },
        }
    }
    else if (categoryId != '' && searchText != '') { 
        reqObj = {
            $match: {
                productCategoryID: ObjectId(categoryId)
            }
        }

        searchObj = {
            $match: {
                $or: [{
                    productTitle: {
                        $regex: searchText,
                        $options: "$ig"
                    },
                }]
            },
        }
    }




    let productDetails = await productModel.aggregate([
        reqObj,
        {
                
               $lookup: {
                    from: "sellers",
                    localField: "SellerStoreID",
                    foreignField: "_id",
                    as: "sellerShopName"
                }},
                 {
                $unwind: "$sellerShopName"
            },
            {
            $lookup: {
                    from: "categories",
                    localField: "productCategoryID",
                    foreignField: "_id",
                    as: "categoryProducts"
                }},
                 {
                $unwind: "$categoryProducts"
            },
            
            
            
                {
                     $project: {
                         productTitle: 1,
                         SellerShopName: "$sellerShopName.storeName",
                         productCategoryID: 1,
                         productCategoryName: "$categoryProducts.categoryTitle",
                         price: 1,
                         currency: 1,
                         productImg: 1,
                         productRating: 1,
                         OverallRating: 1,
                         createdAt: 1,
                         updatedAt: 1
                         },
                    
        },
        searchObj
                
                ])


    const paginatedItems = productDetails.slice(skip).slice(0, limit);
    const total = productDetails.length
    const total_pages = Math.ceil(total / limit)
    return {
        status: true,
        message: "List Fetched Successfully!",
        data: {
            per_page: limit,
            total: total,
            total_pages: total_pages,
            productList: paginatedItems
        }
    }
}

module.exports.getSingleproduct = async (reqParams) => {
    let result = await productModel.findOne({_id: reqParams.id})
    return result
}


module.exports.updateImgForProduct = async (fileLocation, reqParams) => {
    let imgObj;
    let result

    if (reqParams.default == 'false') {
        result = await productModel.findByIdAndUpdate({ _id: reqParams.productId }, {
            $push: {
                thumbnailImgs: fileLocation
            }
        })
    } else {
        result = await productModel.findByIdAndUpdate({ _id: reqParams.productId }, {
        
            $push: {
                thumbnailImgs: fileLocation
            },
            $set:  {
                productImg : fileLocation
            },
        })
    } 

    return result
}


module.exports.removeProductImgs = async (reqParams) => { 
    let result = await productModel.findByIdAndUpdate({ _id: reqParams.productId }, {
        $pull: {
            product_imgs: {_id: reqParams.productImgId}
        } })
    return result
}   