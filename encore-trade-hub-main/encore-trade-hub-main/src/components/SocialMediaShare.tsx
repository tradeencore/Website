import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Twitter, Facebook, Linkedin, Instagram, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialPlatform {
  name: string;
  icon: React.ReactNode;
  url: string;
  maxLength?: number;
  handle: string;
}

interface SocialMediaShareProps {
  postTitle: string;
  postExcerpt: string;
  postUrl: string;
}

export function SocialMediaShare({ postTitle, postExcerpt, postUrl }: SocialMediaShareProps) {
  const { toast } = useToast();
  const [checkedPlatforms, setCheckedPlatforms] = useState<string[]>([]);

  const platforms: SocialPlatform[] = [
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      url: 'https://twitter.com/compose/tweet',
      maxLength: 280,
      handle: '@TradeEncore'
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      url: 'https://www.facebook.com/tradeencore',
      handle: 'Trade Encore'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      url: 'https://www.linkedin.com/company/trade-encore',
      handle: 'Trade Encore'
    },
    {
      name: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      url: 'https://www.instagram.com/tradeencore',
      handle: '@tradeencore'
    }
  ];

  const generateSocialText = (platform: SocialPlatform) => {
    let text = '';
    
    switch (platform.name) {
      case 'Twitter':
        text = `${postTitle}\n\n${postExcerpt}\n\nRead more 👇\n${postUrl}\n\n${platform.handle} #Trading #StockMarket #Investment`;
        break;
      case 'Facebook':
      case 'LinkedIn':
        text = `${postTitle}\n\n${postExcerpt}\n\nRead the full article here: ${postUrl}`;
        break;
      case 'Instagram':
        text = `${postTitle}\n\n${postExcerpt}\n\nLink in bio!\n\n.\n.\n.\n${platform.handle} #Trading #StockMarket #Investment #FinancialMarkets #TradingStrategy`;
        break;
      default:
        text = `${postTitle}\n\n${postUrl}`;
    }
    
    return text;
  };

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `Text copied for ${platform}`,
    });
  };

  const togglePlatform = (platform: string) => {
    setCheckedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          Share on Social Media
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {platforms.map((platform) => {
          const socialText = generateSocialText(platform);
          const isChecked = checkedPlatforms.includes(platform.name);
          
          return (
            <div key={platform.name} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => togglePlatform(platform.name)}
                  />
                  {platform.icon}
                  <span className="font-medium">{platform.name}</span>
                  <span className="text-sm text-gray-500">({platform.handle})</span>
                </div>
                {platform.maxLength && (
                  <Badge variant="secondary">
                    {socialText.length}/{platform.maxLength} chars
                  </Badge>
                )}
              </div>

              {isChecked && (
                <div className="pl-8">
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {socialText}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(socialText, platform.name)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(platform.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open {platform.name}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
