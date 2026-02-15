import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project, Version } from "../types";
import api from "@/configs/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const Preview = () => {

    const {data : session , isPending} = authClient.useSession()
    const { projectId, versionId} = useParams()
    const navigate = useNavigate();
    const [code , setCode] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCode = async () => {
        try {
         const {data} = await api.get(`/api/project/preview/${projectId}`) 
         
         // ✅ Check if project exists
         if(!data.project){
            toast.error('Project not found');
            navigate('/my-projects');
            return;
         }
         
         let projectCode = data.project.current_code;
         
         // ✅ If versionId is provided, use that version's code
         if(versionId){
            const version = data.project.versions.find((v: Version) => v.id === versionId);
            if(version){
                projectCode = version.code;
            }
         }
         
         // ✅ Check if code exists
         if(!projectCode || projectCode.trim() === ''){
            toast.error('No code found for this project. Please generate the website first.');
            navigate(`/editor/${projectId}`);
            return;
         }
         
         setCode(projectCode);
         setLoading(false);
        } catch (error:any) {
            toast.error(error?.response?.data?.message || error.message);
            console.log(error);
            setLoading(false);
            // ✅ Redirect on error
            setTimeout(() => navigate('/my-projects'), 2000);
        }
    }

    useEffect(()=> {
        if(!isPending && session?.user){
            fetchCode()
        }
    },[session?.user]);

    if(loading){
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2Icon className="size-7 animate-spin text-indigo-200"/>
            </div>
        )
    }
    
    // ✅ Show message if no code
    if(!code){
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-gray-400">No preview available for this project.</p>
                <button 
                    onClick={() => navigate(`/editor/${projectId}`)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Go to Editor
                </button>
            </div>
        )
    }

    return (
        <div className="h-screen">
            <ProjectPreview project={{current_code : code} as Project}
            isGenerating={false} showEditorPanel={false}/>
        </div>
    )
}

export default Preview