import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ChefHat, Clock, Star, Users } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: ChefHat,
      title: 'Fresh Food',
      description: 'Delicious meals prepared with the finest ingredients'
    },
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to your doorstep'
    },
    {
      icon: Star,
      title: 'Quality Service',
      description: 'Exceptional service and customer satisfaction'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join thousands of satisfied customers'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary">FoodApp</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover amazing food from the best restaurants in your area. 
            Order online and enjoy delicious meals delivered to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/menu">Browse Menu</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose FoodApp?
          </h2>
          <p className="text-lg text-gray-600">
            We provide the best food ordering experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Order?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of satisfied customers and start ordering today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild>
            <Link to="/menu">View Menu</Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
            <Link to="/register">Sign Up Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
