"use client"

import useUploadModal from "@/hooks/useUploadModal"
import Modal from "./Modal"
import {useRouter} from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import uniqid from 'uniqid'
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const UploadModal = () => {
    const [isLoading, setIsLoading] = useState(false);
    const uploadModal = useUploadModal();
    const router = useRouter();
    const {user} = useUser();
    const supabaseClient = useSupabaseClient();
    const {register, handleSubmit, reset} = useForm<FieldValues>({
        defaultValues:{
            author: '',
            title: '',
            song: null,
            image: null
        }
    });
    const onChange = (open:boolean) => {
        if(!open){
            reset();
            uploadModal.onClose();
        }
    }

    const onSubmit:SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);
            const imageFile = values.image?.[0];
            const songFile = values.song?.[0];
            if(!imageFile || !songFile || !user){
                toast.error("Missing Fields")
                return;
            }
            const uniqID = uniqid();
            const {data:songData,error:songError} = await supabaseClient.storage.from('songs').upload(`song-${values.title}-${uniqID}`,songFile,{
                cacheControl:'3600',
                upsert:false
            })
            if(songError){
                setIsLoading(false);
                return toast.error('Failed Song Upload.')
            }
            const {data:imageData,error:imageError} = await supabaseClient.storage.from('images').upload(`image-${values.title}-${uniqID}`,imageFile,{
                cacheControl:'3600',
                upsert:false
            })
            if(imageError){
                setIsLoading(false);
                return toast.error('Failed image Upload.')
            }

            const {error:supabaseError} = await supabaseClient.from('songs').insert({
                user_id:user.id,
                title:values.title,
                author:values.author,
                song_path:songData.path,
                image_path:imageData.path,
            })
            if(supabaseError){
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }
            router.refresh();
            setIsLoading(false);
            toast.success('Song has been added!');
            reset();
            uploadModal.onClose();
        } catch (error) {
            toast.error("Something Went Wrong")
        }finally{
            setIsLoading(false);
        }
    }

    return(
        <Modal title="Add a song" description="Upload an mp3 file" isOpen={uploadModal.isOpen} onChange={onChange}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                <Input id='title' disabled={isLoading} placeholder="Song Title" {...register('title',{required:true})}/>
                <Input id='author' disabled={isLoading} placeholder="Song Author" {...register('author',{required:true})}/>
                <div>
                    <div className="pb-1">
                        Select a Song File
                    </div>
                    <Input id='song' accept=".mp3" type="file" disabled={isLoading} {...register('song',{required:true})}/>
                </div>
                <div>
                    <div className="pb-1">
                        Select an Image
                    </div>
                    <Input id='image' accept="image/*" type="file" disabled={isLoading} {...register('image',{required:true})}/>
                </div>
                <Button disabled={isLoading} type="submit">
                    Create
                </Button>
            </form>

        </Modal>
    )
}

export default UploadModal