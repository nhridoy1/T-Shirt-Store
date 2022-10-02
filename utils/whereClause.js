
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

        this.base = this.base.find({ ...searchWord })
        return this
    }

    filter() {
        const copyQuery = {...this.query}

        delete copyQuery['search']
        delete copyQuery['limit']
        delete copyQuery['page']
        
        // convert query into a string
        let queryString = JSON.stringify(copyQuery)

        queryString = queryString.replace(/\b(gte|lte|lt|gt)\b/g, m => `$${m}`)

        // converting to json again
        const jsonQuery = JSON.parse(queryString)
        
        this.base = this.base.find(jsonQuery)

        return this
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