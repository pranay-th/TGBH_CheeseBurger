'use client';
import axios from 'axios';
import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';

export default function Dashboard() {
  const [pentestingReport, setPentestingReport] = useState("");
  const [codeSimilarityReport, setCodeSimilarityReport] = useState("");
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [llmSolution, setLlmSolution] = useState<string>('');
  const [isLoading, setIsLoading] = useState({
    pentest: false,
    codeSimilarity: false
  });
  const [error, setError] = useState<{
    pentest: string | null;
    codeSimilarity: string | null;
  }>({
    pentest: null,
    codeSimilarity: null
  });

  // The graph interface markdown content
  const graphInterfaceMarkdown = `# AI-Generated Inferences for Data Visualizations

## Tab Switch Visuals

### Activity Timeline

![Activity Timeline](https://raw.githubusercontent.com/pranay-th/TGBH_CheeseBurger/refs/heads/main/tab_switch_visuals/activity_timeline.png)

**AI Analysis:**

 The image appears to be a screenshot of an activity timeline visualization, possibly from a video game or a software application. This type of visualization is useful for analyzing user behavior over time, which can inform design decisions, performance optimizations, and content development.

From this timeline, we can observe the following patterns:

1. The initial burst of activity around 8 PM, indicating a peak in usage during that time. This could suggest that users are more active at night or during their free time.

2. A consistent level of activity between approximately 9 PM and 4 AM, which is fairly constant with only minor fluctuations. This could indicate a regular pattern of use throughout the night.

3. The activity levels seem to drop off significantly after 6 AM, with very little activity until around 10 AM when it starts to pick up again. This could suggest that users are less active in the early morning hours or have already completed their tasks or sessions for the day.

4. There is a slight increase in activity after 3 PM, which might correspond to a lunch break or a period of increased engagement due to a specific event or announcement.

5. The spike at 11 AM could be an anomaly or an unusual pattern that warrants further investigation. This sudden burst of activity is not part of the regular rhythm and might suggest an unexpected incident, update, or user interaction that caused this surge in participation.

These patterns can suggest several things about user behavior:

- The initial burst suggests that there may be a significant evening rush for the application or game being monitored. This could impact server load and require planning for infrastructure to handle peak traffic.

- The consistent activity during the night indicates that there is a dedicated group of users who continue to use the service, possibly due to its value in their routines or because they prefer to use it at different times than others.

- The drop-off in activity after 6 AM may suggest that the application or game does not have as much engagement during early morning hours, which could be an opportunity for engagement strategies aimed at users who are online then.

- The slight increase around 3 PM could indicate a midday lull when users are at work or school and not using the service. Alternatively, it might suggest that there is some content or event that has captured user attention during this time period.

The spike at 11 AM appears to be unusual as it deviates significantly from the regular activity level. This could indicate a promotional event, an unexpected in-game incident, or some other unforeseen occurrence that has attracted a large number of users to the application or game during this time period. Further investigation would be necessary to understand the cause of this spike and its implications for future planning or product development.

### Hourly Polar Chart

![Hourly Polar Chart](https://raw.githubusercontent.com/pranay-th/TGBH_CheeseBurger/refs/heads/main/tab_switch_visuals/hourly_polar_chart.png)

**AI Analysis:**

 The image displays a polar chart with 12 segments, each representing an hour from midnight to midnight. Here's a breakdown of what the chart shows:

- Hours 3 and 9 (top left and bottom right) are very similar in activity levels, suggesting that there might be an activity peak at these times. This could indicate that many users or systems are either starting up for the day at 3 AM and winding down or preparing to start at 9 PM.
- Hours 10 and 2 (top right and bottom left) show a moderate level of activity, which is somewhat typical for the middle of the night/day (depending on whether it's AM or PM).
- Hour 6 (bottom center) has a very high peak in activity. This suggests that there is a significant spike in activity during this hour, which could be indicative of a common time for work shifts, such as morning or evening rush hours. It might also suggest a common time for online activities or scheduled events.
- There are some smaller peaks and valleys throughout the day, with activity levels fluctuating between 5 AM and 7 PM. This variation is less pronounced than the spikes in the middle of the night/day.

It's important to note that while this chart provides a snapshot of activity distribution at one moment in time, it could be influenced by various factors such as day of the week, seasonal changes, and the nature of the activities being measured (e.g., work-related tasks, social media usage, or online retail sales).

Anomalies that might warrant further investigation include:

1. The very high peak at 6 AM/PM. This is unusual because it's not typical to have such a large spike in activity during what would normally be considered off-peak hours. It could indicate an event or scheduled system maintenance happening during these hours.
2. The relative consistency between 10 PM and 6 AM/PM. While this might suggest that there is some form of ongoing activity, it's also possible that the chart is not representative of an average day. For example, it could be a snapshot from one specific day when activity was skewed towards these times.
3. The small peaks in the morning (between 5 AM and 7 AM) and evening (between 5 PM and 7 PM). These are less pronounced than the spikes at 3 AM/PM and 6 AM/PM, but could indicate smaller sub-peaks within the larger cycles of activity.

These patterns suggest that certain activities or systems might be primarily used during the early morning hours and in the late evening/early morning hours, with a brief period of reduced activity during the middle of the night/day. This might imply that many users have standard work hours and that there is a consistent level of activity throughout most of the day, despite some larger peaks and valleys.

## Keystroke Visuals

### Key Distribution

![Key Distribution](https://raw.githubusercontent.com/pranay-th/TGBH_CheeseBurger/refs/heads/main/keystroke_visuals/key_distribution.png)

**AI Analysis:**

 The visualization shows a pie chart representing the distribution of keys pressed. Here is an analysis of the most frequently used keys and any notable features:

1. Spacebar (key 0) - The largest slice of the pie chart indicates that the spacebar has been pressed more than any other key. This suggests that users are likely using it to separate words or phrases in their text input. It is a common behavior when typing, especially in casual or informal writing.

2. Shift Key (key 1) - The second-largest slice suggests that the shift key has also been pressed quite frequently. This could mean users are frequently switching between upper and lower case letters for emphasis or stylistic reasons, or they might be using it to access additional functions in the system or application they are interacting with.

3. Apostrophe Key (key 2) - The third-largest slice shows that the apostrophe key is also commonly used. This could indicate that users often use contractions or possessive forms, which is a common pattern in English language input.

4. Number Keys (keys 3 to 9) - The slices for the number keys are relatively small but not zero. This suggests that users do enter numbers and mathematical symbols at times, but they might be using other methods of inputting numbers or preferring other types of input for numeric data entry.

5. Function Keys (keys 10 to 12) - The small slice dedicated to function keys indicates that these keys are not frequently used in this particular context. This could mean that users do not rely on specialized functions from their keyboards, or the application being interacted with does not require the use of such keys.

6. Modifier Keys (keys 13 to 19) - The slices for modifier keys like the ctrl, alt, and command/windows keys are also quite small. This implies that users do not often use these keys as a means of navigation or action within the system or application they are using.

7. Special Keys (keys 20 to 29) - The smallest slices indicate that the special keys, such as escape, tab, and backspace, have been used less frequently than any other keys. This might suggest that users prefer to use more direct methods of navigation or they are comfortable with using function keys for these purposes.

8. CapitaLization (keys A to Z) - The caps lock key has a relatively large slice compared to the lowercase letter keys, which could indicate that users frequently switch between upper and lower case letters for emphasis, style, or to enter special commands where capitalization is important.

In summary, the most frequently used keys are the spacebar and shift keys, indicating common typing patterns such as spacing out words, switching between upper and lower case letters, and using contractions or possessive forms. Number keys are also used, but not as commonly as the spacebar or shift keys. Function and modifier keys see less use, suggesting that users primarily rely on them for specific functions rather than general navigation.`;

  const fetchPentestingReport = async () => {
    setIsLoading(prev => ({ ...prev, pentest: true }));
    setError(prev => ({ ...prev, pentest: null }));

    try {
      const response = await axios.post('http://localhost:5050/api/pentesting');
      const getResponse = await axios.get('http://localhost:5050/api/pentesting/report');

      if (getResponse.data.success) {
        setPentestingReport(getResponse.data.content);
      } else {
        throw new Error('Failed to fetch report content');
      }
    } catch (error) {
      console.error('Error fetching pentesting report:', error);
      setError(prev => ({
        ...prev,
        pentest: 'Failed to fetch pentesting report. Please try again later.'
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, pentest: false }));
    }
  };


  useEffect(() => {
    fetchPentestingReport();
  }, []);

  const ReportSection: React.FC<{
    title: string;
    content: string;
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
    similarityScore?: number | null;
    llmSolution?: string;
    maxHeight?: string;
  }> = ({
    title,
    content,
    isLoading,
    error,
    onRetry,
    similarityScore = null,
    llmSolution = '',
    maxHeight
  }) => (
    <div className="w-full max-w-4xl mx-auto mb-8 p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-indigo-400">{title}</h2>
        <div className="flex items-center gap-4">
          {similarityScore !== null && (
            <div className="text-lg text-indigo-400">
              Similarity Score: {similarityScore}/10
            </div>
          )}
          {error && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 p-4 bg-red-900/20 rounded">
          {error}
        </div>
      ) : (
        <div
          className="prose prose-invert max-w-none overflow-y-auto"
          style={{ maxHeight: maxHeight || 'auto' }}
        >
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                return (
                  <code className={`${className} bg-gray-900 p-1 rounded`} {...props}>
                    {children}
                  </code>
                );
              },
              pre({ node, children, ...props }) {
                return (
                  <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto" {...props}>
                    {children}
                  </pre>
                );
              },
              img({ node, ...props }) {
                return (
                  <img
                    {...props}
                    className="max-w-full h-auto rounded-lg my-4"
                    alt={props.alt || "Image"}
                  />
                );
              },
            }}
          >
            {content || "No data available"}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <nav className="bg-gray-800 px-6 py-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-indigo-400">Admin Dashboard</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Security Reports
        </h1>

        <ReportSection
          title="Pentesting Report"
          content={pentestingReport}
          isLoading={isLoading.pentest}
          error={error.pentest}
          onRetry={fetchPentestingReport}
        />

        <ReportSection
          title="Graph Interface Documentation"
          content={graphInterfaceMarkdown}
          isLoading={false}
          error={null}
          onRetry={() => {}}
          maxHeight="500px"  // Set a fixed height to enable scrolling
        />
      </main>

      <footer className="bg-gray-800 py-6 px-6 mt-auto">
        <div className="container mx-auto text-center text-gray-400">
          <p>© {new Date().getFullYear()} TGBH CheeseBurger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}