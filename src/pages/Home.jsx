import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  ChefHat,
  Clock,
  Star,
  Truck,
  Shield,
  Heart,
  Zap,
  Award,
  Globe,
  Smartphone,
  Utensils,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated()) {
      showSuccess("You are already logged in!");
      navigate("/menu");
    } else {
      navigate("/register");
    }
  };

  const features = [
    {
      icon: ChefHat,
      title: "Chef-Crafted",
      description: "Handpicked recipes from our master chefs",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      icon: Clock,
      title: "Lightning Fast",
      description: "Fresh meals delivered in 30 minutes or less",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: Star,
      title: "Premium Quality",
      description: "Only the finest ingredients make it to your plate",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    },
    {
      icon: Truck,
      title: "Free Delivery",
      description: "No delivery fees on orders over $25",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your data and payments are always protected",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      icon: Heart,
      title: "Made with Love",
      description: "Every dish is prepared with care and passion",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50 dark:bg-pink-950/20",
    },
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers", icon: Users },
    { number: "1000+", label: "Menu Items", icon: Utensils },
    { number: "99%", label: "Satisfaction Rate", icon: Star },
    { number: "24/7", label: "Customer Support", icon: Clock },
  ];

  const benefits = [
    "Fresh ingredients daily",
    "30-minute delivery guarantee",
    "100% satisfaction or money back",
    "24/7 customer support",
  ];

  return (
    <div className="min-h-screen">
       {/* Hero Section - Full width and height, no gap from nav */}
       <section className="relative overflow-hidden h-screen -mt-10" style={{
         width: '100vw',
         marginLeft: 'calc(-50vw + 50%)',
         marginRight: 'calc(-50vw + 50%)'
       }}>
        {/* Blurred background image */}
        <div
          className="absolute inset-0 blur-sm scale-105"
          style={{
            backgroundImage: 'url("https://imageproxy.wolt.com/assets/6858ffec0eaf2b3c054f2213")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 w-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              New: Lightning Fast Delivery
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight w-full">
              Taste the
              <span className="block bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Difference
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience culinary excellence with our carefully curated menu.
              Fresh ingredients, masterful preparation, and unforgettable
              flavors await.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-0 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 rounded-xl"
                asChild
              >
                <Link to="/menu" className="flex items-center">
                  <Utensils className="w-5 h-5 mr-2" />
                  Explore Menu
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              {/*<Button*/}
              {/*  variant="outline"*/}
              {/*  size="lg"*/}
              {/*  className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 rounded-xl"*/}
              {/*  onClick={handleGetStarted}*/}
              {/*>*/}
              {/*  <Smartphone className="w-5 h-5 mr-2" />*/}
              {/*  Get Started*/}
              {/*</Button>*/}
            </div>

            {/* Benefits List */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center text-white/90">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  <span className="text-base font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="w-16 h-16 mx-auto mb-3 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                      {stat.number}
                    </div>
                    <div className="text-white/70 text-sm md:text-base font-medium">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-600 dark:bg-white dark:text-black font-medium mb-6">
            <Star className="w-4 h-4 mr-2" />
              Why Choose Us?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight w-full">
              Exceptional
              <span className="block bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Experience
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              We're not just another food delivery service. We're your gateway
              to exceptional culinary experiences that bring people together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800 ${feature.bgColor} rounded-2xl`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  ></div>
                  <CardHeader className="relative z-10 p-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-md`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 p-6 pt-0">
                    <CardDescription className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-center">
        <div className="max-w-6xl mx-auto px-6">
          <Award className="w-6 h-6 mx-auto mb-4" />
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Experience Culinary Magic?
          </h2>

          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of food lovers who trust us for their daily meals.
            Your taste buds will thank you!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 rounded-xl"
              asChild
            >
              <Link to="/menu" className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Start Ordering
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 rounded-xl"
              asChild
            >
              <Link to="/register" className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Join Our Community
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
