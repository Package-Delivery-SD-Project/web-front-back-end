import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  Button, 
  Grid,
  Link,
  Container,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack
} from "@mui/material";
import Header from "../../components/Header";
import { Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';



// Headshots
import jaredImg from '../../headshots/jared.jpeg';
import lucasImg from '../../headshots/lucas.jpeg'; // Note: You might want to use the correct image path
import damianImg from '../../headshots/damian.jpeg';
import nasriImg from '../../headshots/nasri.jpeg';
import damesImg from '../../headshots/dames.jpg';

// SolidWorks images
import solidwork1 from '../../bot_images/solidwork_1.png';
import solidwork2 from '../../bot_images/solidwork_2.png';
import solidwork3 from '../../bot_images/solidwork_3.png';

// Real robot images
import realRobot1 from '../../bot_images/real_bot1.png';
import realRobot2 from '../../bot_images/real_bot2.png';
import realRobot3 from '../../bot_images/real_bot3.png';

// Misc images
import ubuntuImg from '../../misc_images/ubuntu.svg';
import noeticImg from '../../misc_images/noetic.png';
import rtabImg from '../../misc_images/rtab.png';
import drlImg from '../../misc_images/drl.png';
import smachImg from '../../misc_images/smach.png';
import solidImg from '../../misc_images/solidworks.png';
import arduImg from '../../misc_images/ardu.png';
import reactImg from '../../misc_images/react.png';

const COLORS = {
  primary: { 400: '#1F2A40', 500: '#141b2d' },
  grey: { 100: '#e0e0e0', 300: '#c2c2c2', 700: '#404040', 800: '#303030' },
  blueAccent: { 400: '#2196f3', 500: '#1976d2', 700: '#0d47a1', 800: '#0a3880' },
  greenAccent: { 400: '#66bb6a', 500: '#4caf50', 600: '#43a047' },
  redAccent: { 400: '#ef5350', 500: '#f44336', 600: '#e53935' },
  orangeAccent: { 400: '#ffa726', 500: '#ff9800', 600: '#fb8c00' }
};

const AboutComponent = () => {
    const [openImage, setOpenImage] = React.useState(null);
    const handleImageClick = (img) => setOpenImage(img);
    const handleClose = () => setOpenImage(null);
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: COLORS.primary[400], borderRadius: 2 }}>
        <Header title="ABOUT US" subtitle="The Autonomous Package Delivery Robot Project" />
      </Paper>

      <Paper elevation={3} sx={{ p: 4, bgcolor: COLORS.primary[400], borderRadius: 2 }}>
        {/* Project Overview */}
        <Typography variant="h4" color={COLORS.grey[100]} gutterBottom fontWeight="medium">
          Project Overview
        </Typography>
        <Divider sx={{ mb: 3, bgcolor: COLORS.blueAccent[700] }} />
        
        <Typography variant="body1" color={COLORS.grey[100]} paragraph>
          This project is a fully autonomous package delivery robot designed by students at Temple University as part of their senior design capstone. The system is built to operate on a single floor of an academic building, handling the last-meter delivery of packages between offices, classrooms, or labs with minimal human intervention.
        </Typography>
        
        <Typography variant="body1" color={COLORS.grey[100]} paragraph>
          The robot is capable of navigating autonomously using a differential drive base, onboard sensors, and a robust software stack. It integrates real-time obstacle avoidance, route planning, and waypoint-based navigation to deliver packages efficiently and safely.
        </Typography>
        
        <Typography variant="body1" color={COLORS.grey[100]} paragraph>
          This project emphasizes affordability, reliability, and ease of use, leveraging ROS Noetic for core robot logic and a custom React-based dashboard for real-time monitoring and teleoperation. The result is a scalable platform suitable for research environments, academic buildings, and proof-of-concept delivery applications.
        </Typography>

        {/* Technologies */}
        <Typography variant="h4" color={COLORS.grey[100]} mt={5} mb={2} fontWeight="medium">
            Technologies Used
            </Typography>
            <Divider sx={{ mb: 3, bgcolor: COLORS.blueAccent[700] }} />

            <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
                { name: "Ubuntu 20.04", logo: ubuntuImg },
                { name: "ROS Noetic", logo: noeticImg },
                { name: "RTAB-Map", logo: rtabImg },
                { name: "DRL-VO", logo: drlImg },
                { name: "Smach", logo: smachImg },
                { name: "SolidWorks", logo: solidImg },
                { name: "Arduino Firmware", logo: arduImg },
                { name: "React", logo: reactImg },

            ].map((tech, idx) => (
                <Grid item xs={6} sm={4} md={3} key={idx}>
                <Box
                    sx={{
                    bgcolor: 'rgba(255,255,255,0.04)',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'scale(1.05)' }
                    }}
                >
                    <Box
                    component="img"
                    src={tech.logo}
                    alt={tech.name}
                    sx={{
                        width: 64,
                        height: 64,
                        objectFit: 'contain',
                        mb: 1
                    }}
                    />
                    <Typography variant="body1" color={COLORS.grey[100]} fontWeight="medium">
                    {tech.name}
                    </Typography>
                </Box>
                </Grid>
            ))}
            </Grid>


        {/* GitHub Repos */}
        <Typography variant="h4" color={COLORS.grey[100]} mt={5} mb={2} fontWeight="medium">
          GitHub Repositories
        </Typography>
        <Divider sx={{ mb: 3, bgcolor: COLORS.blueAccent[700] }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Button 
              fullWidth 
              variant="contained" 
              component={Link} 
              href="https://github.com/Package-Delivery-SD-Project/Delivery-Bot-Code" 
              target="_blank" 
              rel="noopener"
              sx={{ 
                bgcolor: COLORS.blueAccent[700], 
                py: 1.5,
                fontWeight: "medium",
                fontSize: "1rem",
                '&:hover': { bgcolor: COLORS.blueAccent[800] } 
              }}
            >
              Robot Code GitHub
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button 
              fullWidth 
              variant="outlined" 
              component={Link} 
              href="https://github.com/Package-Delivery-SD-Project/web-front-back-end" 
              target="_blank" 
              rel="noopener"
              sx={{ 
                borderColor: COLORS.blueAccent[700], 
                color: COLORS.grey[100], 
                py: 1.5,
                fontWeight: "medium",
                fontSize: "1rem",
                '&:hover': { borderColor: COLORS.blueAccent[500], bgcolor: 'rgba(33, 150, 243, 0.1)' } 
              }}
            >
              Website Code GitHub
            </Button>
          </Grid>
        </Grid>

        {/* Final Docs */}
        <Typography variant="h4" color={COLORS.grey[100]} mt={5} mb={2} fontWeight="medium">
          Final Deliverables
        </Typography>
        <Divider sx={{ mb: 3, bgcolor: COLORS.blueAccent[700] }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Button 
              fullWidth 
              variant="contained" 
              component={Link} 
              href="https://github.com/Package-Delivery-SD-Project/Delivery-Bot-Code" 
              target="_blank" 
              rel="noopener"
              sx={{ 
                bgcolor: COLORS.greenAccent[500], 
                py: 1.5,
                fontWeight: "medium",
                fontSize: "1rem",
                '&:hover': { bgcolor: COLORS.greenAccent[600] } 
              }}
            >
              Final Design Poster
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button 
              fullWidth 
              variant="outlined" 
              component={Link} 
              href="https://github.com/Package-Delivery-SD-Project/Delivery-Bot-Code" 
              target="_blank" 
              rel="noopener"
              sx={{ 
                borderColor: COLORS.greenAccent[500], 
                color: COLORS.grey[100], 
                py: 1.5,
                fontWeight: "medium",
                fontSize: "1rem",
                '&:hover': { borderColor: COLORS.greenAccent[400], bgcolor: 'rgba(76, 175, 80, 0.1)' } 
              }}
            >
              Final Design Document
            </Button>
          </Grid>
        </Grid>

        {/* Final Presentation */}
        <Box sx={{ mt: 3 }}>
          <Button 
            fullWidth 
            variant="contained" 
            component={Link} 
            href="https://tuprd-my.sharepoint.com/:p:/g/personal/tuo69407_temple_edu/EX2AKHND-zJBpnVKAIwV-ZsB2jSxm3oq2CxmxSGC063uqg?e=BrqgR0" 
            target="_blank" 
            rel="noopener"
            sx={{ 
              bgcolor: COLORS.orangeAccent[500], 
              py: 1.8,
              fontWeight: "bold",
              fontSize: "1.1rem",
              '&:hover': { bgcolor: COLORS.orangeAccent[600] } 
            }}
          >
            View Final Presentation
          </Button>
        </Box>

        {/* Awards */}
        <Typography variant="h4" color={COLORS.grey[100]} mt={5} mb={2} fontWeight="medium">
          Awards & Recognition
        </Typography>
        <Divider sx={{ mb: 3, bgcolor: COLORS.blueAccent[700] }} />
        
        <Card sx={{ bgcolor: 'rgba(255, 152, 0, 0.1)', border: `1px solid ${COLORS.orangeAccent[500]}`, borderRadius: 2, mb: 4 }}>
          <CardContent>
            <Typography variant="h6" color={COLORS.grey[100]} fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
              🏆 Top 5 Finalist
            </Typography>
            <Typography variant="body1" color={COLORS.grey[300]}>
              Spring 2025 Temple University College of Engineering Senior Design Competition
            </Typography>
            <Divider sx={{ my: 2, bgcolor: COLORS.orangeAccent[500], opacity: 0.5 }} />
          </CardContent>
        </Card>

        {/* Image Galleries */}
        <Box sx={{ mt: 6 }}>
          <Grid container spacing={4}>
            {/* SolidWorks Models */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: 'rgba(33, 150, 243, 0.05)', borderRadius: 2, height: '100%' }}>
                <Typography variant="h5" color={COLORS.grey[100]} mb={2} fontWeight="medium">
                  SolidWorks Robot Photos
                </Typography>
                <Divider sx={{ mb: 3, bgcolor: COLORS.blueAccent[700] }} />
                
                <Grid container spacing={2}>
                  {[solidwork1, solidwork2, solidwork3].map((img, idx) => (
                    <Grid item xs={12} sm={4} key={idx}>
                    <Box 
                        component="img"
                        src={img}
                        alt={`Model ${idx + 1}`}
                        onClick={() => handleImageClick(img)}
                        sx={{
                            width: '100%',
                            height: 150,
                            objectFit: 'contain',
                            borderRadius: 1,
                            cursor: 'pointer',
                            bgcolor: '#fff',
                            transition: 'transform 0.3s',
                            '&:hover': { transform: 'scale(1.05)' }
                        }}
                    />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            
            {/* Real Robot Photos */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: 'rgba(33, 150, 243, 0.05)', borderRadius: 2, height: '100%' }}>
                <Typography variant="h5" color={COLORS.grey[100]} mb={2} fontWeight="medium">
                  Real Robot Photos
                </Typography>
                <Divider sx={{ mb: 3, bgcolor: COLORS.blueAccent[700] }} />
                
                <Grid container spacing={2}>
                  {[realRobot1, realRobot2, realRobot3].map((img, idx) => (
                    <Grid item xs={12} sm={4} key={idx}>
                      <Box 
                        component="img"
                        src={img}
                        alt={`Model ${idx + 1}`}
                        onClick={() => handleImageClick(img)}
                        sx={{
                            width: '100%',
                            height: 150,
                            objectFit: 'contain',
                            borderRadius: 1,
                            cursor: 'pointer',
                            bgcolor: '#fff',
                            transition: 'transform 0.3s',
                            '&:hover': { transform: 'scale(1.05)' }
                        }}
                        />

                    </Grid>
                  ))}
                </Grid>
                <Modal open={!!openImage} onClose={handleClose}>
                <Box
                    sx={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    bgcolor: COLORS.primary[500],
                    boxShadow: 24,
                    p: 2,
                    borderRadius: 2,
                    outline: 'none',
                    }}
                >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={handleClose} sx={{ color: COLORS.grey[100] }}>
                    <CloseIcon />
                </IconButton>
                </Box>
                <Box
                component="img"
                src={openImage}
                alt="Expanded View"
                sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    maxHeight: '80vh',
                    objectFit: 'contain',
                }}
                />
            </Box>
            </Modal>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Team Members */}
        <Typography variant="h4" color={COLORS.grey[100]} mt={6} mb={2} fontWeight="medium">
          Meet the Team
        </Typography>
        <Divider sx={{ mb: 4, bgcolor: COLORS.blueAccent[700] }} />
        
        <Grid container spacing={3} justifyContent="center">
  {[
    { name: 'Jared Levin', role: 'Autonomous Navigation, Arduino Firmware, Electrical Design, State Machine Design', img: jaredImg, linkedin: 'https://www.linkedin.com/in/jared-levin/' },
    { name: 'Lucas Raab', role: 'Software, Website Design, Autonomous Navigation, State Machine Design', img: lucasImg, linkedin: 'https://www.linkedin.com/in/lucas-raab/' },
    { name: 'Damian Badawika', role: 'Power Systems, PCB Design, Sensor Integration, Simulation', img: damianImg, linkedin: 'https://www.linkedin.com/in/damian-badawika-261b88221/' },
    { name: 'Nasri Ibrahim', role: 'Arduino Firmware, Mechanical Design', img: nasriImg, linkedin: 'https://www.linkedin.com/in/nasri-i-436319220/' },
    { name: 'Dr. Philip Dames', role: 'Faculty Advisor', img: damesImg, linkedin: 'https://www.linkedin.com/in/philip-dames-8b123b191/' }
  ].map((member, idx) => (
    <Grid item xs={12} sm={6} md={4} key={idx}>
      <Box 
        component="a"
        href={member.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ textDecoration: 'none' }}
      >
        <Card sx={{ 
          bgcolor: 'rgba(33, 150, 243, 0.05)', 
          borderRadius: 2, 
          overflow: 'hidden',
          transition: 'transform 0.3s',
          '&:hover': { transform: 'translateY(-8px)' }
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
            <Avatar 
              src={member.img} 
              alt={member.name}
              sx={{ width: 120, height: 120, mb: 2, border: `3px solid ${COLORS.blueAccent[700]}` }} 
            />
            <Typography variant="h6" color={COLORS.grey[100]} fontWeight="bold" textAlign="center">
              {member.name}
            </Typography>
            <Divider sx={{ width: '40%', my: 1.5, bgcolor: COLORS.blueAccent[700] }} />
            <Typography variant="body2" color={COLORS.grey[300]} textAlign="center" px={2}>
              {member.role}
            </Typography>
          </Box>
        </Card>
      </Box>
    </Grid>
  ))}
</Grid>

      </Paper>
    </Container>
  );
};

export default AboutComponent;