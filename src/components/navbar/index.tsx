import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import type { LinkInterface } from '../../utils/links';
// import { Link } from 'react-router-dom';

const Navbar = (props: any) => {
  const links: LinkInterface[] = props?.links;
  return (
    <div
      style={{
        color: '#ffffff',
        justifyContent: 'center'
      }}>
      <BootstrapNavbar
        style={{
          background: '#222222'
        }}>
        <Container>
          {/* <BootstrapNavbar.Brand href="/">
            <img src={'/assets/insightHub-logo-light.png'} style={{ height: '40px' }} alt="logo" />
          </BootstrapNavbar.Brand> */}
          <h2
            style={{
              paddingTop: '10px',
              paddingLeft: '20px'
            }}>
            InsightHub
          </h2>
          {/* <p>
            Trend programming language explore and visuzaliztion application
          </p> */}
          {/* <Nav className="me-auto">
          {links?.map((link, index) => (
            <Link key={index} to={link.to} style={{ color: 'inherit', textDecoration: 'inherit' }}>
              <Nav.Link key={index} href={link.to}>
                {link.name}
              </Nav.Link>
            </Link>
          ))}
        </Nav> */}
        </Container>
      </BootstrapNavbar>
    </div>
  );
};

export default Navbar;
