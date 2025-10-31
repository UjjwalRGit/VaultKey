import { Shield, Mail, Github, Linkedin, MessageSquare, Lock } from "lucide-react"

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card mt-auto">
            {/* Privacy Message Banner */}
            <div className="bg-primary/5 border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <p className="text-center text-sm md:text-base text-foreground flex items-center justify-center gap-2">
                        <Lock className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>All encryption happens in your browser. Your files never leave your device.</span>
                    </p>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* About Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <h4 className="text-xl font-bold tracking-tight text-foreground">
                                VaultKey
                            </h4>
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            A browser-based file encryption tool that keeps your data private. 
                            Encrypt and decrypt files locally using zero-knowledge encryption — 
                            no files or passwords ever leave your device.
                        </p>
                        {/* <a 
                            href="https://docs.google.com/forms/d/e/1FAIpQLScYloRTk6SdiJXihhkG4G3-ptO4fLIIEZM8R8ka5FLFhgxsPw/viewform?usp=sharing&ouid=110800526281614307267"
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
                        >
                            <MessageSquare className="h-4 w-4" />
                            Share Feedback
                        </a> */}
                    </div>

                    {/* Developer Section */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm">
                                👨‍💻
                            </div>
                            Developer
                        </h4>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Created by
                            </p>
                            <p className="text-base font-semibold text-foreground">
                                Ujjwal Raghuvanshi
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Building practical security tools for everyday use
                            </p>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Mail className="h-4 w-4 text-primary" />
                            </div>
                            Connect
                        </h4>
                        <div className="flex flex-col space-y-2">
                            <a 
                                href="mailto:ujjwal.raghuvanshi2005@gmail.com" 
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent group"
                            >
                                <Mail className="h-4 w-4" />
                                <span className="font-medium">Email</span>
                            </a>
                            <a 
                                href="https://github.com/UjjwalRGit" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent group"
                            >
                                <Github className="h-4 w-4" />
                                <span className="font-medium">GitHub</span>
                            </a>
                            <a 
                                href="https://linkedin.com/in/ujjwal-raghuvanshi-4970a8353/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent group"
                            >
                                <Linkedin className="h-4 w-4" />
                                <span className="font-medium">LinkedIn</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        &copy; {currentYear} VaultKey. Built with React and Web Crypto API
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Zero-knowledge encryption
                        </span>
                        <span>•</span>
                        <span>Client-side only</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}