const express= require('express');
const router = express.Router();


router.get('/',(req, res)=>{
   res.json({message: 'hello user has created'})
})
router.get('/:id',(req, res)=> {
    res.json({message: 'Single user get success'})
})

router.post('/', (req, res) =>{
    res.status(200).json({message: 'user has successfully created'})
})

router.put('/update/:id', (req, res)=> {
    res.json({message: 'user has successfully updated'})
})

module.exports= router