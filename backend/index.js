import express from 'express'

const app = express()


app.get('/home',(req,res)=>{
    res.send("<h1>Hallo home Page</h1>")
}) 

app.listen(3000,()=>{
    console.log(`The page is running http://localhost:3000`)
})
