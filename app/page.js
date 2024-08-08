'use client';
import { Box, Stack, TextField, Button, Typography } from "@mui/material";
import { useState } from "react";

export default function Home() {
  // State to manage the chat history
  const [history, setHistory] = useState([]);

  // Initial welcome message from the assistant
  const firstMessage = "Hi there! I'm the UIUC virtual assistant. How can I help?";

  // State to manage the current message input by the user
  const [message, setMessage] = useState("");

  // Function to convert markdown to HTML-like formatting
  const convertMarkdownToHtml = (text) => {
    // Convert **bold** to <strong>bold</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
      >
        <Stack direction={'column'} spacing={2} overflow={'auto'} mb={2}>
          {/* Initial message from the assistant */}
          <Box
            display={'flex'}
            justifyContent={'flex-end'} // Align the initial message to the right
          >
            <Box
              bgcolor={'secondary.main'}
              borderRadius={10}
              p={2}
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
              justifyContent={textObject.role === 'user' ? 'flex-start' : 'flex-end'}
            >
              <Box
                bgcolor={textObject.role === 'user' ? 'primary.main' : 'secondary.main'}
                color={'white'}
                borderRadius={10}
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
        <Stack direction={'row'} spacing={2} width={'98%'} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          
        <TextField 
        
            label='Message'
            value={message}
            onChange={(e => setMessage(e.target.value))}
            fullWidth
            sx={{ paddingLeft: '5px'
             }}
          />
          <Button variant='contained' onClick={sendMessage}>Send</Button>
        </Stack>
      </Stack>
    </Box>
  );
}