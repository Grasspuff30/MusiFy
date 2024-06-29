export interface Song{
    id:string;
    user_id:string;
    author:string;
    title:string;
    song_path:string;
    image_path:string;
}

export interface UserDetails{
    id:string;
    first_name:string;
    last_name:string;
    full_name?:string;
    avatar_url?:string;
}

export interface UserDetails{
    id:string;
    user_id:string;
    price_id?:string;
    quantity?:string;
    cancel_at_period_end?:boolean;
    created:string;
    current_period_start:string;
    current_period_end:string;
    ended_at?:string;
    cancel_at?:string;
    canceled_at?:string;
    trial_start?:string;
    trial_end?:string;
}