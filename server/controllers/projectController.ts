import {Request, Response} from 'express'
import prisma from '../lib/prisma.js';
import openai from '../configs/openai.js';

// Controller Function to make Revision
export const makeRevision = async (req: Request, res: Response) => {
    const userId = req.userId;

    try {
        const {projectId} =  req.params;
        const {message} = req.body;

        if(!userId){
            return res.status(401).json({message : 'Unauthorized'})
        }

        if(!projectId){
            return res.status(400).json({message: 'Project ID is required'})
        }

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        if(!user){
            return res.status(401).json({message : 'Unauthorized'})
        }
        if(user.credits < 5){
            return res.status(403).json({message: 'add more credits to make changes'})
        }
        if(!message || message.trim()===''){
            return res.status(403).json({message: 'Please enter a valid prompt'})
        }

        const currentProject = await  prisma.websiteProject.findUnique({
            where:{id: projectId as string, userId},
            include: {versions: true}
        })
        if(!currentProject){
            return res.status(404).json({message: 'Project not found'})
        }
        
        await prisma.conversation.create({
            data:{
                role:'user',
                content:message,
                projectId: projectId as string
            }
        })
        await prisma.user.update({
            where: {id: userId},
            data: {credits:{decrement :5}}
        })
        
        console.log('[45vpj] Prompt enhanced');
        
        // Enhance user prompt
        const promptEnhancedResponse = await openai.chat.completions.create({
            model:"z-ai/glm-4.5-air:free", // Your original working model
            messages: [
                {
                    role: 'system',
                    content: `
                    You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

                    Enhance this by:
                    1. Being specific about what elements to change
                    2. Mentioning design details (colors, spacing, sizes)
                    3. Clarifying the desired outcome
                    4. Using clear technical terms

                    Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).`
                },
                {
                    role: 'user',
                    content: `User's request: "${message}"`
                }
            ],
            max_tokens: 150 // ✅ Added token limit
        })
        const enhancedPrompt= promptEnhancedResponse.choices[0].message.content;
        
        console.log('[45vpj] Enhanced prompt:', enhancedPrompt);
        
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
                projectId: projectId as string
            }
        })
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content:'Now making changes to your website...',
                projectId: projectId as string
            }
        })
        
        console.log('[45vpj] Response sent, starting code generation...');
        
        // Generate Website Code According to the new Prompt
        const  codeGenerationResponse = await openai.chat.completions.create({
            model:'z-ai/glm-4.5-air:free', // Your original working model
            messages: [
                {
                   role: 'system',
                   content: `
                   You are an expert web developer. 

                    CRITICAL REQUIREMENTS:
                    - Return ONLY the complete updated HTML code with the requested changes.
                    - Use Tailwind CSS for ALL styling (NO custom CSS).
                    - Use Tailwind utility classes for all styling changes.
                    - Include all JavaScript in <script> tags before closing </body>
                    - Make sure it's a complete, standalone HTML document with Tailwind CSS
                    - Return the HTML Code Only, nothing else

                    Apply the requested changes while maintaining the Tailwind CSS styling approach.

                    ` 
                },
                {
                   role: 'user',
                   content: `Here is the current website code: "${currentProject.current_code}" The user wants this change:"${enhancedPrompt}"` 
                }
            ],
            max_tokens: 4000 // ✅ Added token limit for code generation
        })
        const code = codeGenerationResponse.choices[0].message.content || '';

        console.log('[45vpj] Code generated, length:', code.length);

        if(!code || code.length === 0){
            console.error('[45vpj] ERROR: Empty code response from OpenRouter');
            await prisma.conversation.create({
                data: {
                    role: 'assistant',
                    content: "Unable to generate the code please try again",
                    projectId: projectId as string
                }
            })
            await prisma.user.update({
                where: {id: userId},
                data: {credits:{increment :5}}
            })
            return res.status(500).json({message: 'Failed to generate code'}); 
        }

        const version = await prisma.version.create({
            data: {
                code: code.replace(/```[a-z]*\n?/gi,'').replace(/```$/g, '').trim(),
                description: 'Changes made',
                projectId: projectId as string
            }
        })

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I've made the changes to your Website! you can now preview it",
                projectId: projectId as string
            }
        })
        await prisma.websiteProject.update({
            where: {id: projectId as string},
            data:{
                current_code: code.replace(/```[a-z]*\n?/gi,'').replace(/```$/g, '').trim(),
                current_version_index: version.id
            }
        })

        res.json({message:'changes made successfully'})
    } catch (error: any) {
            await prisma.user.update({
                where: {id: userId},
                data: {credits:{increment :5}}
            })
        
        console.log('[45vpj] ERROR:', error.code || error.message);
        console.error('[45vpj] Full error:', error);
        res.status(500).json({message: error.message})
        
    }
}

// Controller Function to rollback specific version

export const rollbackToversion = async (req: Request , res: Response) => { 
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({message: 'Unauthrized'})
        }
        const { projectId, versionId} = req.params;
        const project = await prisma.websiteProject.findUnique({
            where: {id: projectId as string, userId},
            include:{versions : true}
        })
        if(!project){
            return res.status(404).json({message: 'Project not found'});
        }
        const version = project.versions.find((version)=> version.id === versionId);

        if(!version){
            return res.status(404).json({message: 'Version not found'})
        }
        await prisma.websiteProject.update({
            where: {id: projectId as string, userId},
            data : {
                current_code: version.code,
                current_version_index: version.id
            }
        })
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I've rolled back your website to selected version. You can now preview it",
                projectId: projectId as string
            }
        })

        res.json({message: 'Version rolled back'});
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({message: error.message})
        
    }
}

// Controller function to delete a project
export const deleteProject = async (req: Request , res: Response) => { 
    try {
        const userId = req.userId;
        const { projectId } = req.params;
        
        await prisma.websiteProject.delete({
            where : {id: projectId as string, userId}
        })

        res.json({message: 'Project deleted successfully'})
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({message: error.message})
        
    }
}

// Controller for getting Project Code for Preview

export const getProjectPreview = async (req: Request , res: Response) => { 
    try {
        const userId = req.userId;
        const { projectId } = req.params;
        
        console.log('[PREVIEW] Fetching project:', projectId, 'for user:', userId);
        
        if(!userId){
            console.log('[PREVIEW] ERROR: No userId found');
            return res.status(401).json({message: 'Unauthorized'})
        }
        
        // ✅ First check if project exists at all
        const projectExists = await prisma.websiteProject.findUnique({
            where: {id: projectId as string}
        })
        
        if(!projectExists){
            console.log('[PREVIEW] ERROR: Project does not exist in database:', projectId);
            return res.status(404).json({message: 'Project not found in database'});
        }
        
        console.log('[PREVIEW] Project exists, owner:', projectExists.userId);
        
        // ✅ Then check if user owns it
        const project = await prisma.websiteProject.findFirst({
            where: {id: projectId as string, userId},
            include: {versions: true}
        })

        if(!project){
            console.log('[PREVIEW] ERROR: User does not own this project. Project owner:', projectExists.userId, 'Requesting user:', userId);
            return res.status(403).json({message: 'You do not have permission to view this project'});
        }
        
        console.log('[PREVIEW] Success! Returning project with code length:', project.current_code?.length || 0);
        
        res.json({project})
    } catch (error: any) {
        console.log('[PREVIEW] ERROR:', error.code || error.message);
        res.status(500).json({message: error.message})
        
    }
}

//Get Published Project

export const getPublishedProjects = async (req: Request , res: Response) => { 
    try {
        
        const projects = await prisma.websiteProject.findMany({
            where: {isPublished: true},
            include: {user: true}
        })
        res.json({projects})
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({message: error.message})
        
    }
}

//Get single project by id
export const getProjectById = async (req: Request , res: Response) => { 
    try {

        const {projectId} = req.params;
        const project = await prisma.websiteProject.findFirst({
            where: {id: projectId as string},
        })

        if(!project || project.isPublished === false){
           return res.status(404).json({message: 'Project not found'});
        }

        res.json({code: project.current_code})
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({message: error.message})
        
    }
}

//Controller to save project code 
export const saveProjectCode = async (req: Request , res: Response) => { 
    try {
        const userId = req.userId;
        const {projectId} = req.params;
        const {code} = req.body

        if(!userId){
            return res.status(401).json({message: 'Unauthorized'});
        }

        if(!code){
            return res.status(400).json({message: 'Code is required'})
        }
         
        const project = await prisma.websiteProject.findUnique({
            where: {id: projectId as string, userId}
        })

        if(!project){
            return res.status(404).json({message: 'Project not found'});
        }
        await prisma.websiteProject.update({
            where: {id: projectId as string},
            data:{current_code: code, current_version_index: ''}
        })

        res.json({message : 'Project saved successfully'})
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({message: error.message})
        
    }
}