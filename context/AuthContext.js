import react, {createContext, useState, useEffect} from "react";
import {useRouter} from "next/router";
import jwt from "jsonwebtoken";

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(undefined);
    const [user, setUser] = useState(undefined);

    const router = useRouter();
    const loginRoute = "/user/login";
    const protectedRoute = ["/"];

    useEffect(() => {
        if(!user){
            if(protectedRoute.includes(router.pathname)){
                router.push(loginRoute);
            }
        }else{
            router.push("/");
        }
    }, [router.isReady, router.pathname, user]);

    useEffect(()=>{
        (async () => {
            if(token){
                let result = await checkToken(token);
                if(result.account){
                    setUser(result);
                }else{
                    setUser(undefined);
                }
            }
        })();
    }, [token]);

    useEffect(() => {
        const oldToken = localStorage.getItem("nextBenToken");
        console.log(oldToken);
        (async () => {
            if(oldToken){
                let newToken, error;
                const url = "http://localhost:3005/api/users/status";
        
                newToken = await fetch(url, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${oldToken}`
                    }
                }).then(res=>res.json())
                    .then(result => {
                        if(result.status === "success"){
                            return result.token
                        }else{
                            throw new Error(result.message);
                        }
                    })
                    .catch(err=>{
                        error = err;
                        return undefined;
                });
        
                if(error){
                    alert(error.message);
                    return;
                }
                if(newToken){
                    setToken(newToken);
                    localStorage.setItem("nextBenToken", newToken);
                }
            }
        })();
    }, []);

    const checkToken = async (token) => {
        const secretKey = "peko";
        let decoded;
        try{
            decoded = await new Promise((resolve, reject) => {
                jwt.verify(token, secretKey, (error, data) => {
                    if(error){
                        return reject(error);
                    }
                    resolve(data);
                });
            });
        }catch(err){
            console.log(err);
            decoded = {};
        }

        return decoded;
    }

    return(
        <AuthContext.Provider value={{user, setUser, token, setToken}}>
            {children}
        </AuthContext.Provider>
    )
}