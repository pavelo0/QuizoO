import { Button } from '@/components/ui';

const Header = () => {
  return (
    <header>
      <div className="">
        <div className="">
          <div className="logo">
            <img src="" alt="" className="app-logo" />
            <h2 className="">PostFlow</h2>
          </div>

          <nav>
            <ul>
              <li>
                <a href="">Features</a>
              </li>
              <li>
                <a href="">How it works</a>
              </li>
              <li>
                <a href="">Pricing</a>
              </li>
            </ul>
          </nav>

          <div className="">
            <Button>Log in</Button>
            <Button>Get Started</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
