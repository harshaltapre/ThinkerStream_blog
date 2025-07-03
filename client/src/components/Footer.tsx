import { Link } from "wouter";
import { Twitter, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">TS</span>
              </div>
              <span className="text-xl font-bold">ThinkSpeak</span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering developers with cutting-edge insights and innovative solutions.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Github className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><a href="/#blog" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/#about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/#contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Development</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI & ML</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cloud</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Design</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">Subscribe for weekly tech insights</p>
            <div className="flex">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 rounded-r-none bg-gray-800 border-gray-700 text-white"
              />
              <Button className="rounded-l-none bg-primary hover:bg-primary/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ThinkSpeak by ThinkerStream. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
