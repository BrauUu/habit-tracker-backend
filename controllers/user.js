function login(req, res) {

}

function create(req, res) {
    console.log(req)
    return res.status(200).json()
}

export {
    login,
    create
}