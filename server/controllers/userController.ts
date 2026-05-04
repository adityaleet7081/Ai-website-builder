import{Request, Response} from 'express'
import prisma from '../lib/prisma.js';
import openai from '../configs/openai.js';
import Stripe from 'stripe';

// Get User Credits
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({message : 'Unauthorized'})
        }

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        res.json({credits: user?.credits})
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({message: error.message})
        
    }
}

// Controller Function to create New Project
export const createUserProject = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {
        const {initial_prompt} = req.body
        
        console.log('Creating project for user:', userId); // ✅ DEBUG LOG
        console.log('Initial prompt:', initial_prompt); // ✅ DEBUG LOG
        
        if(!userId){
            return res.status(401).json({message : 'Unauthorized'})
        }

        if(!initial_prompt || !initial_prompt.trim()){
            return res.status(400).json({message: 'Please provide a prompt'})
        }

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })
        
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        
        if(user.credits < 5){
            return res.status(403).json({message: 'add credits to create more projects'});
        }
        
        // Create a new Project
        const project =  await prisma.websiteProject.create({
           data: {
            name:initial_prompt.length> 50? initial_prompt.substring(0,47) + '...': initial_prompt,
            initial_prompt,
            userId
           }
        })

        console.log('Project created:', project.id); // ✅ DEBUG LOG

        //Update User's Total Creation
        await prisma.user.update({
            where: {id:userId},
            data: {totalCreation : {increment: 1}}
        })

        await prisma.conversation.create({
            data: {
                role:'user',
                content: initial_prompt,
                projectId:project.id
            }
        })
        
        await prisma.user.update({
            where: {id : userId},
            data: {credits: {decrement:5}}
        })

        // ✅ FIXED: Send response immediately so frontend can navigate
        // The code generation will continue in background
        res.json({projectId : project.id, message: 'Project created successfully'})
        
        console.log('Response sent, starting code generation...'); // ✅ DEBUG LOG

        // Continue code generation in background
        (async () => {
            try {
                //enhance user prompt using AI
                const promptEnhanceResponse = await openai.chat.completions.create({
                   model: "z-ai/glm-4.5-air:free", 
                   messages: [
                    {
                        role: 'system',
                        content: `
                         You are a world-class UI/UX designer and prompt enhancement specialist. Take the user's website request and expand it into a detailed, visual-first prompt that will result in a stunning, modern, premium-quality website.

                         Enhance this prompt by covering ALL of these aspects:
                         1. VISUAL THEME: Specify a color palette (e.g., deep navy + electric violet accents, or warm cream + rich emerald), dark/light mode preference, overall mood (luxurious, playful, minimal, bold)
                         2. TYPOGRAPHY: Suggest specific Google Fonts pairings (e.g., "Playfair Display for headings, Inter for body")
                         3. KEY SECTIONS: List all required page sections (Hero, About, Features/Services, Portfolio/Work, Testimonials, Pricing, FAQ, Contact, Footer)
                         4. HERO SECTION: Describe a visually impactful hero with gradient backgrounds, large headline, subtext, and CTA buttons
                         5. ANIMATIONS: Specify CSS animations — fade-ins on scroll, hover effects on cards, smooth transitions, gradient animations
                         6. LAYOUT: Grid/flex layouts, card-based designs, proper whitespace, visual hierarchy
                         7. INTERACTIONS: Hover states, button effects, smooth scrolling, interactive elements
                         8. MODERN PATTERNS: Glassmorphism cards, gradient text, frosted-glass navbars, floating elements

                         Return ONLY the enhanced prompt, nothing else. Make it rich and specific (3-4 paragraphs).`
                    },
                    {
                        role: 'user',
                        content: initial_prompt
                    }
                   ]
                })

                const enhancedPrompt = promptEnhanceResponse.choices[0].message.content;
                
                console.log('Prompt enhanced'); // ✅ DEBUG LOG
                
                await prisma.conversation.create({
                    data:{
                        role: 'assistant',
                        content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
                        projectId : project.id
                    }
                })

                await prisma.conversation.create({
                    data:{
                        role: 'assistant',
                        content: 'now generating your website...',
                        projectId : project.id
                    }
                })

                // Generate Website code   
                const codeGenerationResponse = await openai.chat.completions.create({
                    model:"z-ai/glm-4.5-air:free",
                    messages: [
                        {
                            role: 'system',
                            content: `
                             You are a world-class senior frontend engineer and UI/UX designer. Create a STUNNING, production-ready, single-page website. The output must look like it was built by a top-tier design agency.

                             TECH STACK:
                             - Pure HTML5 with Tailwind CSS via CDN
                             - Include this EXACT script in <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                             - Include Google Fonts via CDN for premium typography
                             - Vanilla JavaScript for interactivity

                             MANDATORY DESIGN QUALITY STANDARDS:
                             1. HERO SECTION: Must have a full-viewport hero with a bold gradient or dark background, large impactful headline (text-5xl+), subheading, and at least 2 CTA buttons with hover effects
                             2. COLOR PALETTE: Use a rich, curated palette — avoid plain/flat colors. Use gradients (e.g., from-violet-600 to-indigo-600, from-slate-900 to-slate-800). Use accent colors for highlights.
                             3. TYPOGRAPHY: Use Google Fonts. Combine a display/serif font for headings with a clean sans-serif for body. Apply text-gradient effects on key headings using bg-clip-text.
                             4. GLASSMORPHISM: Use frosted-glass cards (bg-white/10 backdrop-blur-md border border-white/20) for feature cards, testimonials, pricing boxes.
                             5. ANIMATIONS: Add CSS keyframe animations and Tailwind transitions — fade-in on load, hover:scale-105 on cards, hover:shadow-xl on buttons, smooth color transitions.
                             6. SECTIONS: Include all relevant sections: Navbar (sticky, glassmorphic), Hero, Features/Services (3-4 cards in a grid), How It Works or Portfolio, Testimonials, CTA Banner, Footer.
                             7. RESPONSIVE: Fully responsive using Tailwind breakpoints (sm:, md:, lg:, xl:). Mobile hamburger menu if needed.
                             8. MICRO-INTERACTIONS: Hover effects on nav links, animated underlines, button press effects, card lift on hover.
                             9. IMAGES: Use https://picsum.photos/800/600?random=1 (change the number for variety) for realistic placeholder images.
                             10. FOOTER: Rich footer with links, social icons (use emoji or SVG), copyright.

                             STYLE INSPIRATION: Think Stripe, Linear, Vercel, Notion — clean, modern, premium, confidence-inspiring.

                             ABSOLUTE RULES:
                             1. Output ONLY raw HTML. No markdown, no code fences, no explanations, no comments outside the HTML.
                             2. Do NOT include \`\`\`html or \`\`\` anywhere.
                             3. Start directly with <!DOCTYPE html> and end with </html>.
                             4. The website must be VISUALLY IMPRESSIVE — a basic or ugly result is a FAILURE.`
                        },
                        {
                            role: 'user',
                            content: enhancedPrompt || ''
                        }
                    ] 
                })
                
                const code= codeGenerationResponse.choices[0].message.content || '';
                
                console.log('Code generated, length:', code.length); // ✅ DEBUG LOG
                
                if(!code){
                    await prisma.conversation.create({
                        data: {
                            role: 'assistant',
                            content: "Unable to generate the code please try again",
                            projectId: project.id
                        }
                    })
                    await prisma.user.update({
                        where: {id: userId},
                        data: {credits:{increment :5}}
                    })
                    return;
                }

                //create version for the project
                const version = await prisma.version.create({
                    data: {
                        code: code.replace(/```[a-z]*\n?/gi,'').replace(/```$/g, '').trim(),
                        description: 'Initial Version',
                        projectId:project.id
                    }
                })

                await prisma.conversation.create({
                    data:{
                        role:'assistant',
                        content: "I've created your website! You can now preview it and request any changes.",
                        projectId:project.id
                    }
                })

                await prisma.websiteProject.update({
                    where: {id: project.id},
                    data: {
                        current_code :code.replace(/```[a-z]*\n?/gi,'').replace(/```$/g, '').trim(),
                        current_version_index: version.id      
                    }
                })
                
                console.log('Project fully generated:', project.id); // ✅ DEBUG LOG
                
            } catch (bgError: any) {
                console.error('Background code generation error:', bgError);
                // Refund credits on error
                await prisma.user.update({
                    where: {id: userId},
                    data: {credits: {increment: 5}}
                }).catch((err: any) => console.log('Failed to refund credits:', err))
                
                await prisma.conversation.create({
                    data: {
                        role: 'assistant',
                        content: "Sorry, there was an error generating your website. Your credits have been refunded. Please try again.",
                        projectId: project.id
                    }
                }).catch((err: any) => console.log('Failed to create error message:', err))
            }
        })();

    } catch (error: any) {
        console.error('Error creating project:', error); // ✅ IMPROVED ERROR LOG
        
        // Refund credits on error
        if(userId){
            await prisma.user.update({
                where: {id:userId},
                data: {credits: {increment:5}}
            }).catch((err: any) => console.log('Failed to refund credits:', err))
        }
        
        res.status(500).json({message: error.message || 'Failed to create project'})
    }
}

// Controller Function to get a single user Project
export const getUserProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({message : 'Unauthorized'})
        }
        const {projectId} = req.params;
        const project = await prisma.websiteProject.findUnique({
            where : {id: projectId as string, userId},
            include: { 
                conversation: {
                    orderBy: {timestamp: 'asc'}
                },
                versions: {
                    orderBy: {timestamp: 'asc'}
                }
            }
        })

        res.json({project})
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({message: error.message})
        
    }
}

// Controller Function to get all Users Project
export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({message : 'Unauthorized'})
        }
        
        const projects = await prisma.websiteProject.findMany({
            where : {userId},
            orderBy: {updatedAt: 'desc'}
        })

        res.json({projects})
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({message: error.message})
        
    }
}

// Controller Function to toggle Project Publish
export const togglePublish = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({message : 'Unauthorized'})
        }
        
        const {projectId} = req.params;
        const project = await prisma.websiteProject.findUnique({
            where: {id:projectId as string, userId}
        })
        if(!project){
            return res.status(404).json({message : 'Project not found'});
        }
        await prisma.websiteProject.update({
            where: {id:projectId as string},
            data: {isPublished: !project?.isPublished}
        })

        res.json({message: project?.isPublished? 'Project Unpublished' : 'Project Published Successfully'})
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({message: error.message})
        
    }
}

// Controller function to Purchase Credits
export const purchaseCredits = async (req: Request, res: Response) => {
    try {
        interface Plan {
            credits :number,
            amount: number;
        }
        const plans = {
            basic: {credits: 100, amount :5},
            pro: {credits: 400, amount : 19},
            enterprise: {credits: 1000, amount:49},
        }
        const userId = req.userId;
        const {planId} = req.body as {planId: keyof typeof plans } 
        const origin = req.headers.origin as string;


        const plan: Plan=plans[planId]

        if(!plan){
            return res.status(404).json({message: 'Plan not found'});
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId: userId!,
                planId: req.body.planId,
                amount: plan.amount,
                credits: plan.credits
            }
        })

        // to generate the payment link ( we are going to use stripe)
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);  
       
        const session = await stripe.checkout.sessions.create({
        success_url: `${origin}/loading`,
        cancel_url : `${origin}`,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `AiSiteBuilder - ${plan.credits} credits`
                    },
                    unit_amount: Math.floor(transaction.amount) * 100
                },
                quantity: 1
            },
        ],
        mode: 'payment',
        metadata: {
            transactionId: transaction.id,
            appId : 'ai-site-builder'
        },
        expires_at: Math.floor(Date.now()/1000)+30*60, //Expires in 30 minutes
        });

        res.json({payment_link : session.url})

    } 
        catch (error: any) {
            console.log(error.code || error.message);
            res.status(500).json({message: error.message});
        }
}