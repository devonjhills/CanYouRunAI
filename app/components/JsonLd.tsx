export function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CanYouRunAI.com",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Windows, Linux",
    description:
      "Check if your system can run local Large Language Models like LLaMA and GPT4All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "System compatibility checking",
      "Hardware requirements analysis",
      "AI model compatibility verification",
      "Advanced quantization analysis",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
