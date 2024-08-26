import React, { useState } from 'react';
import "./subcomponents/sub-research-and-resources/ResearchAndResources.css"
import TechnologyTrafficPicture from "./subcomponents/sub-technologies/TechnologyTrafficPicture";
import TechnologyLidarPicture from "./subcomponents/sub-technologies/TechnologyLidarPicture";
import TechnologyWebDevPicture from "./subcomponents/sub-technologies/TechnologyWebDevPicture";
import Technology3DModelPicture from "./subcomponents/sub-technologies/Technology3DModelPicture";
import TechnologyDataPicture from "./subcomponents/sub-technologies/TechnologyDataPicture";
import TechnologyObjectDetectionPicture from "./subcomponents/sub-technologies/TechnologyObjectDetectionPicture";
import Technology2DModelPicture from "./subcomponents/sub-technologies/Technology2DModelPicture";

const ResearchAndResources = () => {
  const [selectedLabel, setSelectedLabel] = useState('Resources');

  const handleLabelClick = (label) => {
    setSelectedLabel(label);
  };

  return (
    <div className='main-container'>
      <div className='flex-container'>
        {['Research', 'Resources', 'Technologies'].map(label => (
          <div key={label} className={`flex-item ${label.toLowerCase()}`} onClick={() => handleLabelClick(label)}
               style={{ textDecoration: selectedLabel === label ? 'underline' : 'none' }}>
            {label}
          </div>
        ))}
      </div>
    
         {selectedLabel && (
          <div className='info-container'>
            {/* Render different content based on the selected label */}
            {selectedLabel === 'Research' && 
            <div>

           
            </div>
              }
            {selectedLabel === 'Resources' && 
            <section>
            <div className='container-fluid'>
              <p>
                <h4 id="title-text">General Information on Traffic Monitoring</h4>
                <ul>
                  <li>
                    <a href="https://www.fhwa.dot.gov/policyinformation/tmguide/tmg_2013/traffic-monitoring-theory.cfm">
                      Traffic Monitoring Theory</a> - Information about Traffic Monitoring theory, technology, and concepts
                  </li>
                  <li>
                  <a href="https://www.fhwa.dot.gov/clas/pdfs/traffic_monitoring_guidebook.pdf">
                    Traffic Monitoring Guidebook</a> - General Information about Traffic Monitoring and its purpose
                  </li>
                  <li>
                  <a href="https://worksafetci.com/2023/06/how-does-traffic-monitoring-work/">
                    How Does Traffic Monitoring Work
                  </a> - Concise information regarding Data Collection, Data Analysis, Visualization and more
                  </li>  
                </ul>
              </p>
              <hr/>
              <p>
                <h4 id="title-text">Data Collection Methods</h4>
                <ul>
                    <li>
                      <a href="https://avutec.com/traffic-data-collection-methods-analysis-and-applications/">
                        Traffic Data Collection: Methods, Analysis, and Applications 
                      </a> - Concise information Data Collection methods and the advantages/disadvantages of each method
                    </li>
                  <li>
                    <a href="https://pdf.sciencedirectassets.com/308315/1-s2.0-S2352146523X00039/1-s2.0-S2352146523002120/main.pdf?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEIP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIDfJ69SyZetL%2BIcecknA7N8git0EDaHrohphuV6RJFMZAiEApSJRbjiV2zUqseC3uiSKZuhYoxhJE9hSS2YFst4tQDMquwUInP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAFGgwwNTkwMDM1NDY4NjUiDEUaGEgDd9ls6MYMFiqPBZ0C1lcbN5gcwsfCTVeE%2FGfFOxu3f0UMyj%2B3DUMG8Xqf%2BoOVG38QIVsQQ9iNgZDbvjPTE7Cn3AbYZRVcedevoluvaK%2Fp3IyVxMKPuSq7GbWjE52tTbXI1TnEmxOkKt7DhkFkO5c1Zl9aaOmJ2qtpSWIFJXoM8ldEG%2FQp54HjeSCftfvNI%2FqVyQRgGkco7ZPn3%2B3OSBIV%2B5BRAuMZqGeSrkOzPn5lrCMqi283QqpRwe8fPj%2Bj8ayTBWu018PCyI4tqxyv6qdHQEGCX3lbDTcqkGA1l6ce%2BDwdb3iNDCYoceD4cWIk2qu%2BZCc1YGPaBZdAfQ01VJH3tckGb%2BMsyoIFOV4q7G34RkhTK8QOlZc2UjUciABfWOUxZ7xlDLvuTn024WhHixc95GFal9BeLsawCN1TEqpu9AMCduL%2FNfoPmZQ5YcBzIJCuHLsbwS7wsT8BytBFwJFj8GXTGsXvxSp0h2cgvWdJ3CdiOdkuHPfaNlmkgkga0VZjR%2FZZbO0K3iFw8TKTPH89wK5P76QjOyyC9V8S7zmo2FItpMhQ%2Bn8YXE3nJYvGZYyqcOtNqtMHimvNVX%2B1fY2oltU9RMEwB42S88OfuR39%2FnvipElomNKpnTlOAMN6RcNHrnHeOvTTIDNrH8Bol0rVwdPQVSJGvOMKOmndzKowZUchnGqQrC8G%2BQ%2FG7bn6svSNNezIJrB%2FLaEPWhAy67WSPgfIpQiTZMgmNaOE5sYnCwOC%2FZs7eZRcadKGmZNUzQ8Pyum8vBSUBrxifSGrsBLzTkfrSrJtBuy4PDxKRGva54W2BOl8sOSQUHZGczMVhcQ9JYF3t7FgdGXLuyE2hDMs1mGbTfagMvX8im3TXdeaxr8utZAdHNC7wjcwoOqIsAY6sQEM%2Fi4lYrUQZQNgg1Wt3%2BK%2BGUWLbaxmEYd9EgObYLDyOhdmjJzIFvskvLLjgbVJFYsPfr715iqR0GRAqNxFSFNzt4egxZRU3Ckd2nHpqveu3kZkSIs76HRbYEWgShRVJx6pTa6P6XpE5Q7A3cvpWkJtD0WX9RZiE60E%2FTBcWQxrhqJndJWNg5Rfqhtmdl9NHOxv4dCn3gWAGZtCvw4z%2F3jHgqy%2BHybxZbxADUhfrqkeyoY%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240326T035451Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAQ3PHCVTY5NNLH47Q%2F20240326%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d383785872ba4249bde2b2491e75f9e7bc54110c2c7c2fc95044877363590799&hash=0869bde353114b4aa3e8579ce40526d2a6a47a2934b8ccb38e78de02d29ea0af&host=68042c943591013ac2b2430a89b270f6af2c76d8dfd086a07176afe7c76c2c61&pii=S2352146523002120&tid=spdf-a9fdfb1d-dd5e-4f03-b847-964db1a222f8&sid=5e28110772b6f84ef1298311f09fe545bf90gxrqa&type=client&tsoh=d3d3LnNjaWVuY2VkaXJlY3QuY29t&ua=131158500e5a52540e0f&rr=86a433aa1fb769cd&cc=us">
                      Speed Data Collection Methods: A Review</a> - In-depth article on Traffic Data Collection Methods
                    </li>
                </ul>
              </p>
              <hr/>
              <p>
                <h4 id="title-text">YOLO Algorithm</h4>
                <ul>
                  <li>
                    <a href="https://www.v7labs.com/blog/yolo-object-detection">
                      YOLO Object Detection
                    </a> - In-depth information about the YOLO algorithm used in this project for vehicle detection
                  </li>
                  <li>
                    <a href="https://github.com/onnx/models/tree/main/validated/vision/object_detection_segmentation/yolov4">
                      YOLO v4 </a> - Github page for YOLO v4 model (ONNX)
                  </li>
                </ul>
              </p>
            </div>
            </section>
            }

            {selectedLabel === 'Technologies' && 
            <section>
            <div class="container-fluid">  
              <div class="row row-cols-2">
                {/* Spacing Breaks */}
              <div class="col"></div>
                <div class="col"><br></br><br></br></div> 
      
                <div class="col">
                  <div>
                    <h2 className="techH">Real Time Traffic Monitoring</h2>
                    <p className="techP">
                    The Real-Time Traffic Monitoring project monitors traffic flow in Southern California, 
                    providing a system that collects and streams traffic data, detects and classifies vehicles, 
                    and generates data statistics which describe traffic flow, all in real time. With technologies
                     like LiDAR sensing and machine learning, this system is intended to be an application of 
                     intelligent transportation systems (ITS) in California’s major metropolitan areas.
                    </p>
                  </div>
                </div>
                <div class="col">
                  <div>
                    <TechnologyTrafficPicture />
                  </div>
                </div>
                {/* Spacing Breaks */}
                <div class="col"></div>
                <div class="col"><br></br><br></br></div> 
      
                <div class="col">
                  <TechnologyLidarPicture />
                </div>
                <div class="col">
                  <div>
                    <h2 className="techHR">What is LiDAR?</h2>
                    <p className="techPR">
                    Intelligent transportation systems (ITS) have become increasingly 
                    important to the development of smarter and safer transportation infrastructure, 
                    especially in Southern California, where traffic continues to be a severe 
                    and chronic problem. Vehicle detection technologies greatly support the 
                    applications of ITS, providing information such as the number of vehicles
                     in traffic, number of vehicle types, or density of vehicles in each lane. 
                     This is done through LiDAR data that can provide
                      valuable info that traditional radar or video s ensors can't.
                    </p>
                  </div>
                </div>
              
              {/* Spacing Breaks */}
              <div class="col"></div>
                <div class="col"><br></br><br></br></div> 
      
              
              <div class="col"></div>
                <div class="col"><br></br><br></br></div> 
              
                <div class="col">
                  <div>
                    <h2 className="techH">Web Development</h2>
                    <p className="techP">
                    The creation of our website was done with the help of React libraries! Some that were used were
                     Bootstrap to customize and organize the pages on the website as well as the components on the site. 
                     AWS sdk was used to be able to create a connection between the website and the AWS system. ECharts 
                     was used to display real time data statistics on the website. ReactHLSPlayer was used to be able 
                     to display the real time 2D Video on the website.
                    </p>
                  </div>
                </div>
                <div class="col">
                  <div>
                    <TechnologyWebDevPicture />
                  </div>
                </div>
                {/* Spacing Breaks */}
                <div class="col"></div>
                <div class="col"><br></br><br></br></div>
                <div class="col">
                <TechnologyDataPicture />
                </div>
                <div class="col">
                  <div>
                    <h2 className="techHR">Data Acquisition</h2>
                    <p className="techPR">
                    When it came to data acquisition it all happened thanks to the help of two devices. The 
                    Velodyne Ultra Puck helped capture a 3D scan of the environment in the form of 
                    point clouds in real time. The Intel RealSense Depth Camera D435i helped with 2D data collection, 
                    displaying video and depth metrics, thought we mainly used the camera soley for streaming 
                    without the metrics.
                    </p>
                  </div>
                </div>
                {/* Spacing Breaks */}
              <div class="col"></div>
                <div class="col"><br></br><br></br></div> 
      
              
              <div class="col"></div>
                <div class="col"><br></br><br></br></div> 
      
                <div class="col">
                  <div>
                    <h2 className="techH">2D Model</h2>
                    <p className="techP">
                    When it came to the 2D Model, YOLOv7 tiny was one of the big pieces of technologies. 
                    The most up-to-date and accurate 2D object detection models that makes it perfect for 
                    vehicle detection. LabelImg was used to take relevant images and manually apply bounding 
                    boxes for the sake of training the model to accommodate the project. Google Colab was 
                    used as a cloud hosted version of Jupyter Notebook used to train the custom dataset and 
                    run the model with the aforementioned dataset.
                    </p>
                  </div>
                </div>
                <div class="col">
                  <div>
                  <Technology2DModelPicture />
                  </div>
                </div>
                <div class="col"></div>
                <div class="col"><br></br><br></br></div>
                <div class="col">
                <Technology3DModelPicture />
                </div>
                <div class="col">
                  <div>
                    <h2 className="techHR">3D Model</h2>
                    <p className="techPR">
                    With the 3D model MATLAB (labeling) was used as the lidar labeler toolbox enabling 
                    us to interactively label ground truth data in a point cloud or point cloud sequence and 
                    generate corresponding ground truth data. 
                    
                    </p>
                  </div>
                </div>
                <div class="col"></div>
                <div class="col"><br></br><br></br></div>
              </div>
              
            </div>
            </section>
            }
           
          </div>
        )}
        
      </div>
    )
}
export default ResearchAndResources; 
