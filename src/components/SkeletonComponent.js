import React, { useEffect, useState } from 'react'
import './skeleton.scss'
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
const SkeletonComponent = () => {
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        if(window.innerWidth<600){
            setIsMobile(true)
        }
    }, [])
    const getHeight=()=>{
        if(isMobile){
            return 30
        }
        return 60
    }
    const getRandomWidth=()=>{
        if(isMobile){
            return Math.floor(Math.random() * 100) + 100
        }
        else{
            return Math.floor(Math.random() * 300) + 100
        }
    }


  return (
    <div className='skeleton'>
        <Stack spacing={1}>
    <Skeleton  variant="rounded" width={getRandomWidth()} height={getHeight()} />    
    <div className='d-flex justify-content-end w-100'>
    <Skeleton variant="rounded" width={getRandomWidth()} height={getHeight()} />
    </div>
    <div className='d-flex justify-content-end w-100'>
    <Skeleton variant="rounded"   width={getRandomWidth()} height={getHeight()} />
    </div>
    <Skeleton variant="rounded" width={!isMobile?210:100} height={!isMobile?210:100} />
    <Skeleton variant="rounded"  width={getRandomWidth()} height={getHeight()} />
    <div className='d-flex justify-content-end w-100'>
    <Skeleton variant="rounded"  width={getRandomWidth()} height={getHeight()} />
    </div>
    <div className='d-flex justify-content-end w-100'>
    <Skeleton variant="rounded"  width={getRandomWidth()} height={getHeight()} />
    </div>
    <Skeleton variant="rounded" width={getRandomWidth()} height={getHeight()} />
    <Skeleton variant="rounded" width={getRandomWidth()} height={getHeight()} />
    <div className='d-flex justify-content-end w-100'>
    <Skeleton variant="rounded"  width={getRandomWidth()} height={getHeight()} />
    </div>
    
    <div className='d-flex justify-content-end w-100'>
    <Skeleton variant="rounded"  width={230} height={48} />
    </div>
    <div className='d-flex justify-content-end w-100'>
    <Skeleton variant="rounded"  width={getRandomWidth()} height={getHeight()} />
    </div>
    <Skeleton variant="rounded" width={getRandomWidth()} height={getHeight()} />
    <Skeleton variant="rounded" width={getRandomWidth()} height={getHeight()} />
    <div className='d-flex justify-content-end w-100'>
    <Skeleton variant="rounded"  width={getRandomWidth()} height={getHeight()} />
    </div>
    
    <div className='d-flex justify-content-end w-100'>
    <Skeleton variant="rounded"  width={230} height={48} />
    </div>    <div className='d-flex justify-content-end w-100'>
    <Skeleton variant="rounded"   width={getRandomWidth()} height={getHeight()} />
    </div>
    <Skeleton variant="rounded" width={!isMobile?210:100} height={!isMobile?210:100} />
    <Skeleton variant="rounded"  width={getRandomWidth()} height={getHeight()} />
    <div className='d-flex justify-content-end w-100'>
    <Skeleton variant="rounded"  width={getRandomWidth()} height={getHeight()} />
    </div>

  </Stack>
      
    </div>
  )
}

export default SkeletonComponent
