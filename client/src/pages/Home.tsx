import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { contactSchema } from "@shared/schema";
import type { PostWithRelations, Category, ContactData } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const { data: posts, isLoading: postsLoading } = useQuery<PostWithRelations[]>({
    queryKey: ["/api/posts", { status: "published" }],
    queryFn: async () => {
      const response = await fetch("/api/posts?status=published");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
  });

  const contactForm = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const handleContactSubmit = async (data: ContactData) => {
    try {
      await apiRequest("POST", "/api/contact", data);
      toast({
        title: "Message sent!",
        description: "Thank you for your message. We'll get back to you soon.",
      });
      contactForm.reset();
      setContactModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const featuredPosts = posts?.filter(post => post.featured) || [];
  const latestPosts = posts?.filter(post => !post.featured) || [];

  const filteredPosts = latestPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? post.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                ThinkSpeak
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
              Where technology meets creativity. Explore insights, tutorials, and innovations from the ThinkerStream community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => scrollToSection("blog")}
                className="btn-gradient px-8 py-3 text-lg"
              >
                Explore Blog
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => scrollToSection("about")}
                className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-slate-900"
              >
                About Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Articles</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover our most popular and impactful content, handpicked for you.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.slice(0, 3).map((post) => (
                <BlogCard key={post.id} post={post} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Section */}
      <section id="blog" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-foreground">Latest Posts</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>

              {postsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-muted" />
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded mb-2" />
                        <div className="h-6 bg-muted rounded mb-4" />
                        <div className="h-4 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                  
                  {filteredPosts.length === 0 && (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">No posts found matching your criteria.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              <div className="space-y-8">
                {/* Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant={selectedCategory === null ? "default" : "ghost"}
                        onClick={() => setSelectedCategory(null)}
                        className="w-full justify-between"
                      >
                        All Categories
                        <Badge variant="secondary">{posts?.length || 0}</Badge>
                      </Button>
                      {categories?.map((category) => {
                        const categoryPostCount = posts?.filter(p => p.categoryId === category.id).length || 0;
                        return (
                          <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "ghost"}
                            onClick={() => setSelectedCategory(category.id)}
                            className="w-full justify-between"
                          >
                            {category.name}
                            <Badge variant="secondary">{categoryPostCount}</Badge>
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Newsletter */}
                <Card className="bg-gradient-to-br from-primary to-accent text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Stay Updated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4 text-white/90">
                      Subscribe to our newsletter for the latest tech insights and tutorials.
                    </p>
                    <div className="space-y-3">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="bg-white/10 border-white/20 text-white placeholder-white/70"
                      />
                      <Button className="w-full bg-white text-primary hover:bg-white/90">
                        Subscribe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">About ThinkerStream</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              ThinkerStream is a leading technology company focused on innovation and development. 
              We create cutting-edge solutions and share insights through our ThinkSpeak platform.
            </p>
            <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gradient px-8 py-3 text-lg">
                  Get in Touch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Contact Us</DialogTitle>
                </DialogHeader>
                <Form {...contactForm}>
                  <form onSubmit={contactForm.handleSubmit(handleContactSubmit)} className="space-y-4">
                    <FormField
                      control={contactForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea rows={4} placeholder="Your message" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full btn-gradient">
                      Send Message
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
