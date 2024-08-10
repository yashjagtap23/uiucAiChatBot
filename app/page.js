'use client';
import { Box, Stack, TextField, Button, Typography } from "@mui/material";
import { useState, useRef, useEffect } from "react";

export default function Home() {

  // State to manage the chat history
  const [history, setHistory] = useState([]);

  // Used for auto scrolling the chatlog
  const scrollRef = useRef(null)
  useEffect(() => {
    if (scrollRef.current){
      scrollRef.current.scrollIntoView({ behavior: 'smooth'});
    }
  }, [history])

  // Initial welcome message from the assistant
  const firstMessage = "Hi there! I'm the UIUC virtual assistant. How can I help?";

  // State to manage the current message input by the user
  const [message, setMessage] = useState("");

  // Function to convert markdown to HTML-like formatting
  const convertMarkdownToHtml = (text) => {
    // Convert **bold** to <strong>bold</strong>
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert \n to <br>
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    // Convert italicized words -> does not work 100% of the time because gemini messes up the combined bold and italicized '*' formatting
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Remove excessive <br> tags at the end of the text
    formattedText = formattedText.replace(/(<br>\s*)+$/, '');
    return formattedText;
  };

  // Function to handle sending a message
  const sendMessage = async () => {
    // Add the user's message to the history
    setHistory((history) => [ ...history, { role: "user", parts: [{ text: message }] }]);
    // Clear the message input
    setMessage('');

    // Send the message to the server
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([ ...history, { role: "user", parts: [{ text: message }] }])
    });

    // Get the response data from the server
    const data = await response.json();

    // Convert the model's response to HTML
    const htmlText = convertMarkdownToHtml(data.message || data);
    setHistory((history) => [ ...history, { role: "model", parts: [{ text: htmlText }] }]);
  };

  return (
    <main> 
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
      <h1 className="text-4xl p-4 text-center font-sans">uiucGPT</h1>
      </div>

      <Box
      width={'100vw'}
      height={'100vh'}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      
      <Stack 
        direction={'column'} 
        justifyContent={'flex-end'}
        width={'50%'} 
        height={'80%'} 
        maxHeight={'80%'} 
        border={'2px solid black'} 
        borderRadius={5}
        spacing={3}
        overflow='hidden'
      >
        <Stack direction={'column'} spacing={2} overflow={'auto'} mb={2}
        sx={{
          scrollbarWidth: 'thin',
          scrollbarColor: ' #5E6669 #E8E9EA'
        }}
        >
          {/* Initial message from the assistant */}
          <Box
            display={'flex'}
            justifyContent={'flex-start'} // Align the initial message to the right
            px={1}
          >
            <Box
              bgcolor={'#1F4096'}
              borderRadius={5}
              p={2}
              mt={2}
              maxWidth={'60%'} // Limit the width of the text bubble
            >
              <Typography color={'white'}>
                {firstMessage}
              </Typography>
            </Box>
          </Box>

          {/* Render the chat history */}
          {history.map((textObject, index) => (
            <Box
              key={index}
              display={'flex'}
              justifyContent={textObject.role === 'user' ? 'flex-end' : 'flex-start'}
              paddingX={1}
              ref={scrollRef}
              margin={5}
            >
              <Box
                bgcolor={textObject.role === 'user' ? '#ff5f05' : '#1F4096'}
                color={'white'}
                borderRadius={5}
                p={2}
                maxWidth={'60%'} // Limit the width of the text bubble
              >
                {/* Render HTML content */}
                <Typography
                  dangerouslySetInnerHTML={{ __html: textObject.parts[0].text }}
                />
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Input field and send button */}
        <Stack direction={'row'} spacing={2} width={'98%'} display={'flex'} alignItems={'center'} justifyContent={'space-between'} pb={1} pl='4px'>
          
        <TextField 
        
            /* label='Message'*/
            value={message}
            placeholder="Message"
            onChange={(e => setMessage(e.target.value))}
            fullWidth
            sx={{ paddingLeft: '5px'}}
            onKeyDown={(k) => {
              if (k.key === 'Enter'){
                sendMessage();
              }
            }}
          />
          <Button variant='contained'
          onClick={sendMessage}
          style={{
            minWidth: '75px',
            minHeight: '45px'
          }}
          >Send</Button>
        </Stack>
      </Stack>
    </Box>
    </main>
    
  );
}
