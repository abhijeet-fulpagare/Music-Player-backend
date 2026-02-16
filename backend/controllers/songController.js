import axios from "axios";

const getSongs = async(req,res)=>{
    try{
        const response=await axios.get("https://api.jamendo.com/v3.0/tracks/?client_id=b02719bd&format=jsonpretty&limit=15")
        const data=response.data;
        res.status(200).json(data)
    }
    catch(e){
       console.error(e.message);
       res.status(500).json({message:e.message});
    }
}

const getPlaylistByTag= async(req,res)=>{
    try{
        const tag=(req.params.tag|| req.query.tag || "").toString().trim()
        if(!tag)
            return res.status(400).json({message:"Missing tag parameters"});

        const limit=parseInt(req.query.limit ?? 10,10)||10;
        const clientId="b02719bd";
        const params={
            client_id:clientId,
            format:"jsonpretty",
            tags:tag,
            limit,
        }
        const response=await axios.get("https://api.jamendo.com/v3.0/tracks/",{params})

        return res.status(200).json(response.data);
    }
    catch(e){
       console.error("get playlistTag error",e?.response?.data ?? e.message ?? e);
    }

    return res.status(500).json({message:"failed to fetch"});
}

const toggleFavorite=async(req,res)=>{
    try{

            const user=req.user;
            const song=req.body.song;

            const exists=user.favourites.find((fav)=>fav.id === song.id);

            if(exists){
                user.favourites=user.favourites.filter((fav)=>fav.id !== song.id)
            }
            else{
                user.favourites.push(song);
            }

            await user.save();

            return res.status(200).json(user.favourites)
  
    }
    catch(e){
        console.error(e.message);
        return res.status(400).json({message:"favourite not added,Something went wrong"});
    }
}

export {getSongs,getPlaylistByTag,toggleFavorite};