// Helper to generate realistic data for missing fields
const normalizeUniversityData = (uni, research, rankingData) => {
    try {
        const country = uni.country || 'Unknown';
        const globalRank = rankingData.find(r => r.provider === 'Simulated Global')?.rank || 999;

        // 1. Tuition Simulation (Based on Country)
        // Heuristic: North America & UK are more expensive
        let tuitionMin = 15000;
        let tuitionMax = 35000;
        let currency = 'USD';

        if (country === 'United States') {
            tuitionMin = 20000; tuitionMax = 50000;
        } else if (country === 'United Kingdom') {
            tuitionMin = 15000; tuitionMax = 40000;
        } else if (country === 'Canada') {
            tuitionMin = 18000; tuitionMax = 45000;
        } else if (country === 'Australia') {
            tuitionMin = 20000; tuitionMax = 45000;
        }

        // 2. Admissions Requirements Simulation (Based on Rank)
        let minGPA = 2.7;
        let minSAT = 1000;
        let minIELTS = 6.0;

        if (globalRank < 100) {
            minGPA = 3.5; minSAT = 1400; minIELTS = 7.5;
        } else if (globalRank < 300) {
            minGPA = 3.2; minSAT = 1250; minIELTS = 7.0;
        } else if (globalRank < 600) {
            minGPA = 3.0; minSAT = 1150; minIELTS = 6.5;
        }

        const university = {
            name: uni.name,
            country: country,
            images: [
                `https://source.unsplash.com/800x600/?university,campus,${encodeURIComponent(uni.name)}`,
                `https://source.unsplash.com/800x600/?students,library`
            ],
            admissions: {
                requirements: {
                    minGPA: minGPA,
                    testScores: {
                        sat: { min: minSAT },
                        ielts: { min: minIELTS },
                        toefl: { min: Math.floor(minIELTS * 13) }
                    }
                },
                applicationDeadlines: [
                    { term: 'Fall', year: 2025, deadline: new Date('2024-12-15') },
                    { term: 'Spring', year: 2026, deadline: new Date('2025-06-15') }
                ]
            },
            financials: {
                tuitionFee: {
                    international: {
                        min: tuitionMin,
                        max: tuitionMax,
                        currency: currency
                    }
                }
            },
            academics: {
                majorsOffered: ['Computer Science', 'Business Administration', 'Mechanical Engineering', 'Psychology', 'Economics']
            },
            researchMetrics: research ? {
                hIndex: research.hIndex,
                citations: research.citations,
                worksCount: research.worksCount,
                source: 'OpenAlex'
            } : {},
            ranking: {
                dataset: rankingData,
                global: globalRank
            },
            pipelineMetadata: {
                lastUpdated: new Date(),
                sources: ['Hipo', 'OpenAlex', 'Simulated'],
                processingErrors: []
            },
            contact: {
                website: uni.web_pages?.[0] || ''
            }
        };

        return university;
    } catch (error) {
        console.error('Normalization error:', error);
        return null;
    }
};

module.exports = { normalizeUniversityData };
