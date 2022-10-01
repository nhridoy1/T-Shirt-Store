// Product.find({})
// 1. query
// 2. query projection (used for which fields to include or exclude from the query)
// 3. general query (limit, skip)

// /api/v1/product?search=coder&page=2&category=shortsleeves&rating[gte]=4&price[lte]=999&price[gte]=199&limit=5


class WhereClause {
    constructor(base, query) {
        this.base = base,
        this.query = query
    }

    search() {
        const searchWord = this.query.search ? {
            name: {
                $regex: this.query.search,
                $option: 'i'
            }
        } : {}
        // log this one
        this.base = this.base.find({ ...searchWord })
        return this
    }

    filter() {
        const copyQuery = {...this.query}
        // log this one
        delete copyQuery['search']
        delete copyQuery['limit']
        delete copyQuery['page']

        // convert query into a string
        let queryString = JSON.stringify(copyQuery)
        // log this one
        queryString = queryString.replace(/\b(gte|lte|lt|gt)\b/g, m => `$${m}`)

        // converting to json again
        const jsonQuery = JSON.parse(queryString)
        
        this.base = this.base.find(jsonQuery)
    }

    pagination(resultPerPage) {
        let currentPage = 1

        if (this.query.page) {
            currentPage = this.query.page
        }

        let skipValue = resultPerPage * (currentPage - 1)

        this.base = this.base.limit(resultPerPage).skip(skipValue)
        return this
    }
}

module.exports = WhereClause